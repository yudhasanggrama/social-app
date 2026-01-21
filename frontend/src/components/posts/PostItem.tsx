import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { Thread } from "@/Types/thread";
import api from "@/lib/api";
import { socket } from "@/lib/socket";

const PostItem = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Record<number, boolean>>({}); // anti spam click

  const fetchThreads = async () => {
    try {
      const res = await api.get("/threads");
      setThreads(res.data.data.threads);
    } catch (e) {
      console.error("Failed to fetch threads", e);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchThreads();

  const onCreated = (thread: Thread) => {
    setThreads((prev) => (prev.some((t) => t.id === thread.id) ? prev : [thread, ...prev]));
  };

  const onLikeUpdated = (p: {
    threadId: number;
    likesCount: number;
    actorUserId: number;
    liked: boolean;
  }) => {
    console.log("[client] received like_updated:", p);
    if (!p || typeof p.threadId !== "number" || typeof p.likesCount !== "number") {
    console.warn("[client] invalid like_updated payload:", p);
    return;
  }
    setThreads((prev) =>
      prev.map((t) =>
        t.id === p.threadId
          ? {
              ...t,
              likes: p.likesCount,
            }
          : t
      )
    );
  };

  socket.on("thread:created", onCreated);
  socket.on("thread:like_updated", onLikeUpdated);

  return () => {
    socket.off("thread:created", onCreated);
    socket.off("thread:like_updated", onLikeUpdated);
  };
}, []);


  const toggleLike = async (threadId: number) => {
    if (toggling[threadId]) return;

    const prevThreads = threads;

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              isLiked: !t.isLiked,
              likes: t.isLiked ? t.likes - 1 : t.likes + 1,
            }
          : t
      )
    );

    setToggling((p) => ({ ...p, [threadId]: true }));

    try {
      const res = await api.post("/likes/toggle", { thread_id: threadId });

      const likedFromServer: boolean | undefined = res.data?.result?.liked;

      if (typeof likedFromServer === "boolean") {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? { ...t, isLiked: likedFromServer }
              : t
          )
        );
      } else {
        await fetchThreads();
      }
    } catch (e) {
      console.error("Toggle like failed", e);
      setThreads(prevThreads);
    } finally {
      setToggling((p) => ({ ...p, [threadId]: false }));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {threads.map((thread) => (
        <div
          key={thread.id}
          className="flex gap-4 px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900/50"
        >
          <Avatar>
            <AvatarImage
              src={thread.user?.profile_picture ?? "https://github.com/shadcn.png"}
            />
            <AvatarFallback>
              {(thread.user?.name?.[0] ?? "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1 text-sm">
              <span className="font-semibold text-zinc-100">
                {thread.user?.name ?? "Unknown"}
              </span>
              <span className="text-zinc-400">
                @{thread.user?.username ?? "unknown"} ·{" "}
              {new Date(thread.created_at).toLocaleString()}
              </span>
            </div>

            <p className="mt-1 text-sm text-zinc-200 leading-relaxed">
              {thread.content}
            </p>

            {thread.image && (
              <img
                  src={`http://localhost:9000${thread.image}`}
                  alt="thread"
                  className=" mt-3 w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto rounded-lg object-cover max-h-64 sm:max-h-80 md:max-h-96"
                />
            )}

            <div className="mt-3 flex items-center gap-8 text-zinc-400 text-sm">
              <button className="flex items-center gap-1 hover:text-zinc-200">
                <MessageCircle className="h-4 w-4" />
                <span>{thread.reply}</span>
              </button>

              <button
                onClick={() => toggleLike(thread.id)}
                disabled={!!toggling[thread.id]}
                className={`flex items-center gap-1 ${
                  thread.isLiked ? "text-red-500" : "hover:text-zinc-200"
                } ${toggling[thread.id] ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <Heart
                  className="h-4 w-4"
                  fill={thread.isLiked ? "currentColor" : "none"}
                />
                <span>{thread.likes}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default PostItem;
