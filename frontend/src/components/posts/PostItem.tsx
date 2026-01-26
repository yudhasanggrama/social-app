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
  id?: number | string;
  likes?: number | string;
  likesCount?: number | string;
  isLiked?: boolean; // private only
};

const toNumber = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export default function PostItem() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  const fetchThreads = async () => {
    try {
      const res = await api.get("/threads", { withCredentials: true });
      const list = (res.data?.data?.threads ?? res.data?.threads ?? []) as Thread[];
      setThreads(list);

      // ✅ REST seed: isLiked + likesCount
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

    const onThreadCreated = (payload: any) => {
      const t: any = payload?.thread ?? payload;
      if (!t?.id) return;

      setThreads((prev) => {
        const exists = prev.some((x: any) => Number(x.id) === Number(t.id));
        if (exists) return prev;
        return [t as Thread, ...prev];
      });

      // ✅ seed untuk thread baru
      dispatch(
        setThreadLikeFromServer({
          threadId: toNumber(t.id),
          isLiked: Boolean(t.isLiked),
          likesCount: toNumber(t.likes ?? 0),
        })
      );
    };

    const onLikeUpdated = (payload: LikePayload) => {
      const rawThreadId = payload.threadId ?? payload.id;
      const threadId = toNumber(rawThreadId, 0);
      if (!threadId) return;

      const likesCount =
        payload.likesCount !== undefined
          ? toNumber(payload.likesCount)
          : payload.likes !== undefined
          ? toNumber(payload.likes)
          : undefined;

      // ✅ update list lokal: count always, isLiked only if exists
      setThreads((prev) =>
        prev.map((t: any) => {
          if (toNumber(t.id) !== threadId) return t;
          const next: any = { ...t };
          if (likesCount !== undefined) next.likes = likesCount;
          if (typeof payload.isLiked === "boolean") next.isLiked = payload.isLiked;
          return next;
        })
      );

      // ✅ socket patch: COUNT only / isLiked only if sent (private)
      const patch: any = { threadId };
      if (likesCount !== undefined) patch.likesCount = likesCount;
      if (typeof payload.isLiked === "boolean") patch.isLiked = payload.isLiked;

      dispatch(setThreadLikeFromServer(patch));
    };

    socket.on("thread:created", onThreadCreated);
    socket.on("thread:like_updated", onLikeUpdated);

    return () => {
      socket.off("thread:created", onThreadCreated);
      socket.off("thread:like_updated", onLikeUpdated);
    };
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {threads.map((t: any) => (
        <PostRow key={toNumber(t.id)} thread={t} />
      ))}
    </>
  );
}
