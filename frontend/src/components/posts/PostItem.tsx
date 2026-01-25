import { useEffect, useState } from "react";
import type { Thread } from "@/Types/thread";
import api from "@/lib/api";
import { socket } from "@/lib/socket";
import PostRow from "./PostRow";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/types";
import { setThreadLikeFromServer } from "@/store/likes";

const PostItem = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  const fetchThreads = async () => {
    try {
      const res = await api.get("/threads");
      const list = res.data.data.threads as Thread[];
      setThreads(list);

      list.forEach((t) => {
        dispatch(
          setThreadLikeFromServer({
            threadId: t.id,
            isLiked: Boolean(t.isLiked),
            likesCount: Number(t.likes ?? 0),
          })
        );
      });
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
      dispatch(
        setThreadLikeFromServer({
          threadId: thread.id,
          isLiked: Boolean(thread.isLiked),
          likesCount: Number(thread.likes ?? 0),
        })
      );
    };

    const onLikeUpdated = (p: { threadId: number; likesCount: number }) => {
      if (!p || typeof p.threadId !== "number" || typeof p.likesCount !== "number") return;

      dispatch(
        setThreadLikeFromServer({
          threadId: p.threadId,
          isLiked: false as any,
          likesCount: p.likesCount,
        }) as any
      );
    };

    socket.on("thread:created", onCreated);
    socket.on("thread:like_updated", onLikeUpdated);

    return () => {
      socket.off("thread:created", onCreated);
      socket.off("thread:like_updated", onLikeUpdated);
    };
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return <>
    {threads.map((t) => <PostRow key={t.id} thread={t} />)}
  </>;
};

export default PostItem;
