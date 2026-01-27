import { useEffect, useState, useCallback } from "react";
import type { Thread } from "@/Types/thread";
import api from "@/lib/api";
import { socket } from "@/lib/socket";
import PostRow from "./PostRow";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/types";
import { setThreadLikeFromServer } from "@/store/likes";
import { selectMe, selectAvatarVersion } from "@/store/profile";

const toNumber = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export default function PostItem() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  const me = useSelector(selectMe);
  const v = useSelector(selectAvatarVersion);
  
  const patchMyAvatar = useCallback(
    (newAvatar: string) => {
      setThreads((prev) =>
        prev.map((t: any) => {
          const authorId = Number(t?.user?.id ?? t?.User?.id ?? t?.user_id ?? 0);
          if (authorId !== Number(me?.id)) return t;
          return {
            ...t,
            user: t.user ? { ...t.user, avatar: newAvatar } : t.user,
            User: t.User ? { ...t.User, avatar: newAvatar } : t.User,
          };
        })
      );
    },
    [me?.id]
  );

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

  // patch avatar tiap avatarVersion berubah (setelah kamu update avatar)
  useEffect(() => {
    if (!me?.id) return;

    const newAvatar =
      (me as any)?.avatar ??
      (me as any)?.profile_picture ??
      (me as any)?.photo_profile ??
      "";

    if (!newAvatar) return;

    patchMyAvatar(newAvatar);
  }, [v, me?.id, patchMyAvatar, me]);

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

      dispatch(
        setThreadLikeFromServer({
          threadId: toNumber(t.id),
          isLiked: Boolean(t.isLiked),
          likesCount: toNumber(t.likes ?? 0),
        })
      );
    };

    const onLikeUpdated = (payload: any) => {
      const rawThreadId = payload.threadId ?? payload.id;
      const threadId = toNumber(rawThreadId, 0);
      if (!threadId) return;

      const likesCount =
        payload.likesCount !== undefined
          ? toNumber(payload.likesCount)
          : payload.likes !== undefined
          ? toNumber(payload.likes)
          : undefined;

      setThreads((prev) =>
        prev.map((t: any) => {
          if (toNumber(t.id) !== threadId) return t;
          const next: any = { ...t };
          if (likesCount !== undefined) next.likes = likesCount;
          if (typeof payload.isLiked === "boolean") next.isLiked = payload.isLiked;
          return next;
        })
      );

      const patch: any = { threadId };
      if (likesCount !== undefined) patch.likesCount = likesCount;
      if (typeof payload.isLiked === "boolean") patch.isLiked = payload.isLiked;

      dispatch(setThreadLikeFromServer(patch));
    };

    // (opsional) realtime avatar lewat socket
    const onAvatarUpdated = (payload: any) => {
      const userId = toNumber(payload?.userId ?? payload?.id, 0);
      const avatar = String(payload?.avatar ?? payload?.photo_profile ?? "");
      if (!userId || !avatar) return;
      if (userId !== toNumber(me?.id, 0)) return;
      patchMyAvatar(avatar);
    };

    socket.on("thread:created", onThreadCreated);
    socket.on("thread:like_updated", onLikeUpdated);
    socket.on("profile:avatar_updated", onAvatarUpdated); // kalau event ini ada

    return () => {
      socket.off("thread:created", onThreadCreated);
      socket.off("thread:like_updated", onLikeUpdated);
      socket.off("profile:avatar_updated", onAvatarUpdated);
    };
  }, [dispatch, me?.id, patchMyAvatar]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {threads.map((t: any) => (
        <PostRow key={toNumber(t.id)} thread={t} />
      ))}
    </>
  );
}
