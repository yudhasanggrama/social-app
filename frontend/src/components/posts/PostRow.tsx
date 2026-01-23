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
} from "@/store/likes";

export default function PostRow({ thread }: { thread: Thread }) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const like = useSelector(selectThreadLike(thread.id));
  const pending = useSelector(selectLikePending(`thread:${thread.id}`));

  const images =
    Array.isArray(thread.image) && thread.image.length > 0
      ? thread.image.map((p) => `http://localhost:9000${p}`)
      : [];

  const onToggleLike = async () => {
    const prev = like;

    dispatch(optimisticToggleThread({ threadId: thread.id }));
    try {
      await dispatch(toggleThreadLike(thread.id)).unwrap();
    } catch (e) {
      console.error("Toggle like failed", e);
      dispatch(rollbackThread({ threadId: thread.id, prev }));
    }
  };

  return (
    <div
      key={thread.id}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/thread/${thread.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") navigate(`/thread/${thread.id}`);
      }}
      className="flex gap-4 px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900/50"
    >
      <Avatar>
        <AvatarImage src={thread.user?.profile_picture ?? "https://github.com/shadcn.png"} />
        <AvatarFallback>{(thread.user?.name?.[0] ?? "U").toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <span className="font-semibold text-zinc-100">{thread.user?.name ?? "Unknown"}</span>
          <span className="text-zinc-400">
            @{thread.user?.username ?? "unknown"} · {new Date(thread.created_at).toLocaleString()}
          </span>
        </div>

        <p className="mt-1 text-sm text-zinc-200 leading-relaxed">{thread.content}</p>

        {images.length > 0 && <ThreadImages images={images} />}

        <div className="mt-3 flex items-center gap-8 text-zinc-400 text-sm">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/thread/${thread.id}`);
            }}
            className="flex items-center gap-1 hover:text-zinc-200"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{thread.reply}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike();
            }}
            disabled={pending}
            className={`flex items-center gap-1 ${
              like.isLiked ? "text-red-500" : "hover:text-zinc-200"
            } ${pending ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <Heart className="h-4 w-4" fill={like.isLiked ? "currentColor" : "none"} />
            <span>{like.likesCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
