import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { Thread } from "@/Types/thread";
import type { ReplyItem } from "@/Types/reply";
import api from "@/lib/api";
import SidebarLeft from "@/components/sidebars/SidebarLeft";
import SidebarRight from "@/components/sidebars/SidebarRight";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImagePlus, Heart, MessageCircle } from "lucide-react";
import { socket } from "@/lib/socket";
import { useSelector } from "react-redux";
import  type{ RootState } from "@/store/types";

export default function ThreadDetailPage() {
  const { id } = useParams();
  const threadId = Number(id);
  const myUserId = useSelector((s: RootState) => s.auth.id);

  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // reply composer
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  // reply images
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const replyPreviewUrls = useMemo(
    () => replyFiles.map((f) => URL.createObjectURL(f)),
    [replyFiles]
  );

  // like thread
  const [likeLoading, setLikeLoading] = useState(false);

  // cleanup preview urls
  useEffect(() => {
    return () => {
      replyPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [replyPreviewUrls]);

  const removeReplyImage = (index: number) => {
    setReplyFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // fetch detail + replies
  useEffect(() => {
    if (!threadId) return;

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);

        const [tRes, rRes] = await Promise.all([
          api.get(`/threads/${threadId}`, { signal: controller.signal, withCredentials: true }),
          api.get(`/threads/${threadId}/replies`, { signal: controller.signal, withCredentials: true }),
        ]);

        setThread(tRes.data.data as Thread);
        setReplies((rRes.data.data?.replies ?? []) as ReplyItem[]);
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        console.error("Failed to fetch detail thread", e);
        setThread(null);
        setReplies([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [threadId]);

  // images (thread)
  const threadImages = useMemo(
    () => (Array.isArray(thread?.image) ? thread!.image : []),
    [thread]
  );

  // submit reply (multipart)
 const handleSubmitReply = async () => {
  if (!replyText.trim() && replyFiles.length === 0) return;

  try {
    setReplyLoading(true);

    const formData = new FormData();
    formData.append("thread_id", String(threadId));
    formData.append("content", replyText);

    replyFiles.forEach((f) => formData.append("images", f));

    const res = await api.post("/replies", formData, { withCredentials: true });

    const newReply = (res.data?.reply ?? res.data?.data?.reply) as ReplyItem;

    if (!newReply?.id) {
      console.error("Reply payload invalid:", res.data);
      return;
    }

    setReplies((prev) => (prev.some((r) => r.id === newReply.id) ? prev : [newReply, ...prev]));
    setReplyText("");
    setReplyFiles([]);
  } catch (err: any) {
    console.error("Failed to create reply", {
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message,
    });
  } finally {
    setReplyLoading(false);
  }
};


  // toggle thread like
  const toggleThreadLike = async () => {
    if (!thread || likeLoading) return;

    const prevThread = thread;

    // optimistic update
    setThread({
      ...thread,
      isLiked: !thread.isLiked,
      likes: thread.isLiked ? thread.likes - 1 : thread.likes + 1,
    });

    setLikeLoading(true);

    try {
      const res = await api.post(
        "/likes/toggle",
        { thread_id: thread.id },
        { withCredentials: true }
      );

      const { liked, likesCount } = res.data.result;

      setThread((t) =>
        t
          ? {
              ...t,
              isLiked: liked,
              likes: likesCount,
            }
          : t
      );
    } catch (e) {
      console.error("Toggle like failed", e);
      setThread(prevThread);
    } finally {
      setLikeLoading(false);
    }
  };

  // realtime socket updates
  useEffect(() => {
    if (!threadId) return;

    const onThreadLikeUpdated = (p: {
      threadId: number;
      likesCount: number;
      actorUserId: number;
      liked: boolean;
    }) => {
      if (p.threadId !== threadId) return;

      setThread((prev) =>
        prev
          ? {
              ...prev,
              likes: p.likesCount,
              isLiked: p.actorUserId === myUserId ? p.liked : prev.isLiked,
            }
          : prev
      );
    };

    const onReplyLikeUpdated = (p: {
      replyId: number;
      threadId: number;
      likesCount: number;
      actorUserId: number;
      liked: boolean;
    }) => {
      if (p.threadId !== threadId) return;

      setReplies((prev) =>
        prev.map((r) =>
          r.id === p.replyId
            ? {
                ...r,
                likes: p.likesCount,
                isLiked: p.actorUserId === myUserId ? p.liked : r.isLiked,
              }
            : r
        )
      );
    };

    // optional: realtime reply created (if you emit "reply:created" from server)
    const onReplyCreated = (p: { threadId: number; reply: ReplyItem }) => {
      if (p.threadId !== threadId) return;
      setReplies((prev) => (prev.some((r) => r.id === p.reply.id) ? prev : [p.reply, ...prev]));
    };

    socket.on("thread:like_updated", onThreadLikeUpdated);
    socket.on("reply:like_updated", onReplyLikeUpdated);
    socket.on("reply:created", onReplyCreated);

    return () => {
      socket.off("thread:like_updated", onThreadLikeUpdated);
      socket.off("reply:like_updated", onReplyLikeUpdated);
      socket.off("reply:created", onReplyCreated);
    };
  }, [threadId, myUserId]);

  // toggle reply like (only works if backend supports reply-like)
  const toggleReplyLike = async (replyId: number) => {
    // optimistic
    setReplies((prev) =>
      prev.map((r) =>
        r.id === replyId
          ? {
              ...r,
              isLiked: !r.isLiked,
              likes: r.isLiked ? r.likes - 1 : r.likes + 1,
            }
          : r
      )
    );

    try {
      const res = await api.post(
        "/reply-likes/toggle",
        { reply_id: replyId },
        { withCredentials: true }
      );

      const likedFromServer: boolean | undefined = res.data?.data?.liked ?? res.data?.result?.liked;
      const likesCountFromServer: number | undefined =
        res.data?.data?.likesCount ?? res.data?.result?.likesCount;

      if (typeof likedFromServer === "boolean" && typeof likesCountFromServer === "number") {
        setReplies((prev) =>
          prev.map((r) =>
            r.id === replyId ? { ...r, isLiked: likedFromServer, likes: likesCountFromServer } : r
          )
        );
      }
    } catch (e) {
      console.error("Toggle reply like failed", e);
      try {
        const rRes = await api.get(`/threads/${threadId}/replies`, { withCredentials: true });
        setReplies(rRes.data.data?.replies ?? []);
      } catch {}
    }
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!thread) return <div className="p-6 text-white">Thread tidak ditemukan</div>;

  return (
    <div className="flex min-h-screen bg-black text-white">
      <SidebarLeft />

      <div className="ml-64 flex flex-1">
        <main className="flex-1 border-x border-zinc-800">
          <div className="sticky top-0 z-10 border-b border-zinc-800 bg-black/80 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                className="rounded-full p-2 hover:bg-zinc-900"
                title="Back"
                onClick={() => history.back()}
              >
                ←
              </button>
              <div className="text-lg font-semibold">Status</div>
            </div>
          </div>

          {/* Thread Card */}
          <section className="border-b border-zinc-800 px-4 py-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={(thread.user as any)?.photo_profile || "https://github.com/shadcn.png"}
                />
                <AvatarFallback>
                  {(thread.user?.name || "U").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate font-semibold">{thread.user.name}</div>
                  <div className="truncate text-sm text-zinc-500">@{thread.user.username}</div>
                </div>

                <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">
                  {thread.content}
                </p>

                {/* Thread images */}
                {threadImages.length > 0 && (
                  <div className="mt-3">
                    {threadImages.length === 1 ? (
                      <img
                        src={`http://localhost:9000${threadImages[0]}`}
                        className="w-full max-h-[32rem] rounded-xl object-cover border border-zinc-800"
                        alt="thread"
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {threadImages.map((img, i) => (
                          <img
                            key={i}
                            src={`http://localhost:9000${img}`}
                            className="h-48 w-full rounded-xl object-cover border border-zinc-800"
                            alt={`thread-${i}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex items-center gap-6 text-zinc-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleThreadLike();
                    }}
                    disabled={likeLoading}
                    className={`flex items-center gap-2 ${
                      thread.isLiked ? "text-red-500" : "hover:text-zinc-300"
                    } ${likeLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <Heart className="h-4 w-4" fill={thread.isLiked ? "currentColor" : "none"} />
                    <span className="text-xs">{thread.likes}</span>
                  </button>

                  <button className="flex items-center gap-2 hover:text-zinc-300">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{replies.length}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Reply composer */}
          <section className="border-b border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>

              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply!"
                className="w-full bg-transparent text-[15px] placeholder:text-zinc-500 focus:outline-none"
                disabled={replyLoading}
              />

              <label
                className={`rounded-full p-2 text-green-500 hover:bg-green-500/10 cursor-pointer ${
                  replyLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title="Add image"
              >
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  disabled={replyLoading}
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length === 0) return;
                    setReplyFiles((prev) => [...prev, ...files]);
                    e.currentTarget.value = "";
                  }}
                />
                <ImagePlus className="h-5 w-5" />
              </label>

              <Button
                type="button"
                onClick={handleSubmitReply}
                className="h-8 rounded-full bg-green-500 px-5 text-sm"
                disabled={replyLoading || (!replyText.trim() && replyFiles.length === 0)}
              >
                {replyLoading ? "Posting..." : "Post"}
              </Button>
            </div>

            {/* Reply image previews */}
            {replyPreviewUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {replyPreviewUrls.map((url, idx) => (
                  <div
                    key={url}
                    className="relative overflow-hidden rounded-lg border border-zinc-800"
                  >
                    <img
                      src={url}
                      className="h-24 w-full object-cover"
                      alt={`reply-preview-${idx}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeReplyImage(idx)}
                      disabled={replyLoading}
                      className="absolute top-1 right-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Replies list */}
          <section>
            {replies.length === 0 ? (
              <div className="px-4 py-6 text-sm text-zinc-500">Belum ada reply</div>
            ) : (
              replies.map((r) => (
                <div
                  key={r.id}
                  className="border-b border-zinc-800 px-4 py-4 hover:bg-zinc-900/30"
                >
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={(r.user as any)?.photo_profile || "https://github.com/shadcn.png"}
                      />
                      <AvatarFallback>
                        {(r.user?.name || "U").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold">{r.user.name}</div>
                        <div className="truncate text-xs text-zinc-500">@{r.user.username}</div>
                      </div>

                      <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">{r.content}</p>

                      {/* If backend returns reply.image as string */}
                      {Array.isArray((r as any).image) && (r as any).image.length > 0 && (
                        <div className="mt-2">
                          {(r as any).image.length === 1 ? (
                            <img
                              src={`http://localhost:9000${(r as any).image[0]}`}
                              className="w-full max-h-80 rounded-xl object-cover border border-zinc-800"
                              alt="reply"
                            />
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {(r as any).image.map((img: string, i: number) => (
                                <img
                                  key={i}
                                  src={`http://localhost:9000${img}`}
                                  className="h-40 w-full rounded-xl object-cover border border-zinc-800"
                                  alt={`reply-${i}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}


                      <div className="mt-2 flex items-center gap-6 text-zinc-500">
                        <button
                          onClick={() => toggleReplyLike(r.id)}
                          className={`flex items-center gap-1 text-sm ${
                            r.isLiked ? "text-red-500" : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <Heart className="h-4 w-4" fill={r.isLiked ? "currentColor" : "none"} />
                          <span>{r.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </main>

        <aside className="hidden w-[380px] border-l border-zinc-800 lg:block">
          <SidebarRight />
        </aside>
      </div>
    </div>
  );
}
