import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThreadImages from "@/helpers/ThreadsImageProps";
import type { Thread } from "@/Types/thread";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/types";
import {
  selectThreadLike,
  selectLikePending,
  optimisticToggleThread,
  rollbackThread,
  toggleThreadLike,
  setThreadLikeFromServer,
} from "@/store/likes";

import { publicUrl, avatarImgSrc } from "@/lib/image";
import { selectAvatarVersion } from "@/store/profile";

const toNumber = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export default function PostRow({ thread }: { thread: Thread }) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const v = useSelector(selectAvatarVersion);

  const tid = toNumber((thread as any).id, 0);

  const likeState = useSelector(selectThreadLike(tid));
  const pending = useSelector(selectLikePending(`thread:${tid}`));

  const like = likeState ?? {
    isLiked: Boolean((thread as any).isLiked),
    likesCount: toNumber((thread as any).likes),
  };

  useEffect(() => {
    if (!tid) return;
    if (likeState) return;

    dispatch(
      setThreadLikeFromServer({
        threadId: tid,
        isLiked: Boolean((thread as any).isLiked),
        likesCount: toNumber((thread as any).likes),
      })
    );
  }, [dispatch, likeState, tid, thread]);

  const images =
    Array.isArray((thread as any).image) && (thread as any).image.length > 0
      ? (thread as any).image.map((p: string) => publicUrl(p)).filter(Boolean)
      : [];

  const onToggleLike = async () => {
    if (!tid) return;
    const prev = like;

    dispatch(optimisticToggleThread({ threadId: tid }));
    try {
      await dispatch(toggleThreadLike(tid)).unwrap();
    } catch (e) {
      console.error("Toggle like failed", e);
      dispatch(rollbackThread({ threadId: tid, prev }));
    }
  };

  const author = (thread as any)?.user;
  const authorAvatar = avatarImgSrc(
    author?.avatar ?? author?.profile_picture ?? author?.photo_profile,
    v
  );

  return (
    <div
      key={tid || String((thread as any).id)}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/thread/${tid}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") navigate(`/thread/${tid}`);
      }}
      className="flex gap-4 border-b border-zinc-800 px-4 py-4 hover:bg-zinc-900/50"
    >
      <Avatar>
        <AvatarImage src={authorAvatar} />
        <AvatarFallback>
          {(((author?.name?.[0] ?? "U") as string).toUpperCase())}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <span className="font-semibold text-zinc-100">{author?.name ?? "Unknown"}</span>
          <span className="text-zinc-400">
            @{author?.username ?? "unknown"} ·{" "}
            {(thread as any).created_at ? new Date((thread as any).created_at).toLocaleString() : ""}
          </span>
        </div>

        <p className="mt-1 text-sm leading-relaxed text-zinc-200">{(thread as any).content}</p>

        {images.length > 0 && <ThreadImages images={images} />}

        <div className="mt-3 flex items-center gap-8 text-sm text-zinc-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike();
            }}
            disabled={pending}
            className={`flex items-center gap-1 ${
              like.isLiked ? "text-red-500" : "hover:text-zinc-200"
            } ${pending ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <Heart className="h-4 w-4" fill={like.isLiked ? "currentColor" : "none"} />
            <span>{like.likesCount}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/thread/${tid}`);
            }}
            className="flex items-center gap-1 hover:text-zinc-200"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{(thread as any).reply ?? 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
