import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/types";
import { followThunk, unfollowThunk } from "@/store/follow";

type Props = {
  userId: string | number;
  isFollowing: boolean;
  onToggle?: (next: boolean) => void;
};

export default function FollowButton({ userId, isFollowing, onToggle }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const idNum = Number(userId);

  async function onClick() {
    if (!Number.isFinite(idNum)) return;

    const next = !isFollowing;

    // ✅ optimistic update
    onToggle?.(next);

    try {
      if (isFollowing) {
        await dispatch(unfollowThunk(idNum)).unwrap();
      } else {
        await dispatch(followThunk(idNum)).unwrap();
      }
    } catch (e) {
      // rollback
      onToggle?.(isFollowing);
    }
  }

  return (
    <Button
      onClick={onClick}
      variant={isFollowing ? "outline" : "default"}
      className={`rounded-full px-4 py-1 text-sm ${
        isFollowing
          ? "border border-zinc-600 text-zinc-200"
          : "bg-white text-black hover:bg-zinc-200"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
