import { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/types";

import SidebarLeft from "@/components/sidebars/SidebarLeft";
import SidebarRight from "@/components/sidebars/SidebarRight";
import CreatePostDialog from "@/components/threads/CreatePostDialog";
import EditProfileDialog from "@/components/profile/EditProfileDialog";

import { useFollowSocket } from "@/hooks/useFollowSocket";
import { useLikeSocket } from "@/hooks/useLikeSocket";

import {
  fetchProfile,
  selectMe,
  selectIsProfileLoading,
  selectProfileFetchStatus,
} from "@/store/profile";

export default function AppLayout() {
  useFollowSocket();
  useLikeSocket();

  const dispatch = useDispatch<AppDispatch>();

  const me = useSelector(selectMe);
  const loading = useSelector(selectIsProfileLoading);
  const fetchStatus = useSelector(selectProfileFetchStatus);

  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [openEditProfile, setOpenEditProfile] = useState(false);

  // ✅ bootstrap profile 1x di layout
  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchProfile());
    }
  }, [dispatch, fetchStatus]);

  const coverStyle = useMemo(
    () => ({
      background:
        "linear-gradient(90deg, rgba(74,222,128,0.85), rgba(253,224,71,0.85))",
    }),
    []
  );

  // - ketika app baru start → fetchStatus "idle" lalu jadi "loading"
  // - selama idle/loading → tampilkan loading screen
  const bootstrapping = fetchStatus === "idle" || fetchStatus === "loading" || loading;

  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-black text-zinc-400 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // setelah bootstrapping selesai:
  // - kalau me ada → tampil user
  // - kalau me null → tampil guest (final, tanpa flicker)
  return (
    <div className="min-h-screen bg-black text-white">
      <CreatePostDialog open={openCreatePost} onOpenChange={setOpenCreatePost} />

      <EditProfileDialog
        open={openEditProfile}
        onOpenChange={setOpenEditProfile}
        coverStyle={coverStyle}
      />

      <SidebarLeft onCreatePost={() => setOpenCreatePost(true)} />

      <div className="ml-64 flex justify-center">
        <div className="flex w-full">
          <main className="min-w-0 flex-1 border-x border-zinc-800">
            <Outlet
              context={{
                openCreatePost: () => setOpenCreatePost(true),
                openEditProfile: () => setOpenEditProfile(true),
                me, // optional: kalau page butuh cepat akses user dari outlet context
              }}
            />
          </main>

          <aside className="hidden w-[360px] border-l border-zinc-800 lg:block">
            <SidebarRight onEditProfile={() => setOpenEditProfile(true)} />
          </aside>
        </div>
      </div>
    </div>
  );
}
