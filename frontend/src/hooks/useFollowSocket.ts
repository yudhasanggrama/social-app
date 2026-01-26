import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/types";
import { socket } from "@/lib/socket";
import {
  fetchFollowersThunk,
  fetchFollowingThunk,
  fetchSuggestedThunk,
  followChanged,
} from "@/store/follow";

export function useFollowSocket() {
  const dispatch = useDispatch<AppDispatch>();
  const myId = useSelector((s: RootState) => s.auth.id);

  // ✅ connect socket setelah login
  useEffect(() => {
    if (!myId) return;

    if (!socket.connected) socket.connect();

    const onConnect = () => console.log("🟢 socket connected:", socket.id);
    const onDisconnect = (r: any) => console.log("🔴 socket disconnected:", r);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      if (socket.connected) socket.disconnect();
    };
  }, [myId]);

  // ✅ listen follow:changed + update store + refresh lists (optional)
  useEffect(() => {
    if (!myId) return;

    const handler = (payload: {
      followerId: any;
      targetUserId: any;
      isFollowing: boolean;
    }) => {
      dispatch(followChanged(payload as any));

      // refresh biar suggested/followers selalu akurat
      dispatch(fetchFollowersThunk());
      dispatch(fetchFollowingThunk());
      dispatch(fetchSuggestedThunk(5));
    };

    socket.on("follow:changed", handler);
    return () => {
      socket.off("follow:changed", handler);
    };
  }, [dispatch, myId]);
}
