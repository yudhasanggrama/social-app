import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarLeft from "@/components/sidebars/SidebarLeft";
import SidebarRight from "@/components/sidebars/SidebarRight";

import CreatePostDialog from "@/components/threads/CreatePostDialog";
import EditProfileDialog from "@/components/profile/EditProfileDialog";

import { useFollowSocket } from "@/hooks/useFollowSocket"; // ✅ pakai hook

export default function AppLayout() {
  useFollowSocket(); // ✅ socket follow realtime di sini

  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [openEditProfile, setOpenEditProfile] = useState(false);

  const coverStyle = useMemo(
    () => ({
      background:
        "linear-gradient(90deg, rgba(74,222,128,0.85), rgba(253,224,71,0.85))",
    }),
    []
  );

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
