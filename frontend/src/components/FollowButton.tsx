import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/types";
import { followThunk, unfollowThunk } from "@/store/follow";

type Props = {
    userId: string | number;
    isFollowing: boolean;
};

export default function FollowButton({ userId, isFollowing }: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const idNum = Number(userId);

    function onClick() {
        if (!Number.isInteger(idNum)) return;
        if (isFollowing) dispatch(unfollowThunk(idNum));
        else dispatch(followThunk(idNum));
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
