import { useEffect, useState } from "react";
import type { Thread } from "@/Types/thread";
import api from "@/lib/api";
import { socket } from "@/lib/socket";
import PostRow from "./PostRow";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/types";
import { setThreadLikeFromServer } from "@/store/likes";

type LikePayload = {
  threadId?: number | string;
  id?: number | string; // kadang pakai id
  likes?: number | string;
  likesCount?: number | string;
  isLiked?: boolean;
  userId?: number | string;
};

const toNumber = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const PostItem = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  const fetchThreads = async () => {
    try {
      const res = await api.get("/threads", { withCredentials: true });
      const list = (res.data?.data?.threads ?? res.data?.threads ?? []) as Thread[];
      setThreads(list);

      list.forEach((t: any) => {
        dispatch(
          setThreadLikeFromServer({
            threadId: toNumber(t.id),
            isLiked: Boolean(t.isLiked),
            likesCount: toNumber(t.likes ?? 0),
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

    const onCreated = (payload: any) => {
      const t: any = payload?.thread ?? payload;
      if (!t?.id) return;

      setThreads((prev) => {
        const exists = prev.some((x: any) => Number(x.id) === Number(t.id));
        if (exists) return prev;
        return [t as Thread, ...prev];
      });

      dispatch(
        setThreadLikeFromServer({
          threadId: toNumber(t.id),
          isLiked: Boolean(t?.isLiked),
          likesCount: toNumber(t?.likes ?? 0),
        })
      );
    };

    const onLikeUpdated = (payload: LikePayload) => {
      const threadId = payload?.threadId ?? payload?.id;
      const idNum = toNumber(threadId, 0);
      if (!idNum) return;

      const likesCount =
        payload?.likesCount !== undefined
          ? toNumber(payload.likesCount)
          : payload?.likes !== undefined
          ? toNumber(payload.likes)
          : undefined;

      // update local list (optional tapi bikin UI post list ikut update)
      setThreads((prev) =>
        prev.map((t: any) => {
          if (Number(t.id) !== idNum) return t;
          const next: any = { ...t };
          if (likesCount !== undefined) next.likes = likesCount;
          if (typeof payload.isLiked === "boolean") next.isLiked = payload.isLiked;
          return next;
        })
      );

      dispatch(
        setThreadLikeFromServer({
          threadId: idNum,
          isLiked: typeof payload.isLiked === "boolean" ? payload.isLiked : false,
          likesCount: likesCount ?? 0,
        })
      );
    };

    socket.on("thread:created", onCreated);

    // ✅ listen beberapa nama event biar aman
    socket.on("thread:likeUpdated", onLikeUpdated);
    socket.on("thread:like_updated", onLikeUpdated);
    socket.on("thread:like", onLikeUpdated);
    socket.on("like:updated", onLikeUpdated);

    return () => {
      socket.off("thread:created", onCreated);

      socket.off("thread:likeUpdated", onLikeUpdated);
      socket.off("thread:like_updated", onLikeUpdated);
      socket.off("thread:like", onLikeUpdated);
      socket.off("like:updated", onLikeUpdated);
    };
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {threads.map((t: any) => (
        <PostRow key={Number(t.id)} thread={t} />
      ))}
    </>
  );
};

export default PostItem;
