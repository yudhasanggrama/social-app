import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/types";
import { socket } from "@/lib/socket";
import { followChanged } from "@/store/follow";
import { profileFollowCountChanged } from "@/store/profile";

export function useFollowSocket() {
  const dispatch = useDispatch<AppDispatch>();
  const myId = useSelector((s: RootState) => s.auth.id);

  // connect socket setelah login
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
    };
  }, [myId]);

  // listen follow:changed + patch store
  useEffect(() => {
    if (!myId) return;

    const handler = (payload: {
      followerId: number;
      targetUserId: number;
      isFollowing: boolean;
      followerUser?: { id: string; username: string; name: string; avatar: string };
    }) => {
      // 1) update counts untuk MyProfilePage & SidebarRight
      dispatch(profileFollowCountChanged({ myId, ...payload }));

      // 2) update followers/following/suggested lists
      dispatch(followChanged({ myId, ...payload }));
    };

    socket.on("follow:changed", handler);
    return () => {
      socket.off("follow:changed", handler);
    };
  }, [dispatch, myId]);
}
