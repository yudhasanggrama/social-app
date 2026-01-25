import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/types";
import { fetchProfile, selectMe } from "@/store/profile";
import SidebarLeft from "@/components/sidebars/SidebarLeft";
import SidebarRight from "@/components/sidebars/SidebarRight";

import { socket } from "@/lib/socket";
import { fetchFollowersThunk, fetchFollowingThunk, fetchSuggestedThunk } from "@/store/follow";

export default function AppLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const me = useSelector(selectMe);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // kalau belum login: jangan connect socket & jangan fetch follow lists
    if (!me?.id) return;

    // normalize id supaya tidak error number vs string
    const myId = Number(me.id);
    if (!Number.isFinite(myId)) return;

    // ✅ bootstrap (sekali saat me.id berubah / login akun baru)
    dispatch(fetchProfile());
    dispatch(fetchFollowersThunk());
    dispatch(fetchFollowingThunk());
    dispatch(fetchSuggestedThunk(5));

    // ✅ connect socket hanya kalau belum connect
    if (!socket.connected) socket.connect();

    const scheduleRefetch = (flags: { followers?: boolean; following?: boolean; suggested?: boolean }) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (flags.followers) dispatch(fetchFollowersThunk());
        if (flags.following) dispatch(fetchFollowingThunk());
        if (flags.suggested) dispatch(fetchSuggestedThunk(5));
      }, 150);
    };

    const handler = (p: { followerId: number; targetUserId: number; isFollowing: boolean }) => {
      // aku yang klik follow/unfollow
      if (p.followerId === myId) {
        scheduleRefetch({ followers: true, following: true, suggested: true });
        return;
      }

      // aku yang di-follow/unfollow orang lain
      if (p.targetUserId === myId) {
        scheduleRefetch({ followers: true });
      }
    };

    socket.on("follow:changed", handler);

    return () => {
      socket.off("follow:changed", handler);
      if (timerRef.current) clearTimeout(timerRef.current);
      // ❌ jangan disconnect di sini (disconnect saat logout saja)
    };
  }, [dispatch, me?.id]);

  return (
    <div className="min-h-screen bg-black text-white">
      <SidebarLeft />
      <div className="ml-64 flex justify-center">
        <div className="flex w-full">
          <main className="min-w-0 flex-1 border-x border-zinc-800">
            <Outlet />
          </main>
          <aside className="hidden w-[360px] border-l border-zinc-800 lg:block">
            <SidebarRight />
          </aside>
        </div>
      </div>
    </div>
  );
}
