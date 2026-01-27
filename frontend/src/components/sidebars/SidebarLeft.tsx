import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarNav } from "./SidebarNav";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { logout } from "@/store";
import type { AppDispatch } from "@/store/types";

import {
  selectMe,
  selectIsProfileLoading,
  selectAvatarVersion,
} from "@/store/profile";

import { avatarImgSrc } from "@/lib/image";
import { resetAll } from "@/store/index";
import { socket } from "@/lib/socket";

const SidebarLeft = ({ onCreatePost }: { onCreatePost: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const me = useSelector(selectMe);
  const loading = useSelector(selectIsProfileLoading);
  const v = useSelector(selectAvatarVersion);

  const handleLogout = async () => {
    try {
      await api.post("/logout", null, { withCredentials: true });
    } catch {
      // ignore
    } finally {
      if (socket.connected) socket.disconnect();
      dispatch(resetAll());
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

  const name = me?.name ?? "Guest";
  const username = me?.username ?? "guest";
  const avatarSrc = avatarImgSrc(me?.avatar, v);
  const fallback = (name[0] ?? "U").toUpperCase();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-zinc-950 border-x">
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-green-500">circle</h1>
      </div>

      <div className="flex-1 px-2">
        <SidebarNav onCreatePost={onCreatePost} />
      </div>

      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={avatarSrc} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>

            <div className="text-sm">
              {loading ? (
                <>
                  <div className="h-4 w-28 animate-pulse rounded bg-zinc-800" />
                  <div className="mt-1 h-3 w-20 animate-pulse rounded bg-zinc-800" />
                </>
              ) : (
                <>
                  <p className="font-medium">{name}</p>
                  <p className="text-zinc-400">@{username}</p>
                </>
              )}
            </div>
          </div>

          <LogOut
            onClick={handleLogout}
            className={`h-5 w-5 cursor-pointer text-zinc-400 hover:text-red-500 ${
              loading ? "opacity-50 pointer-events-none" : ""
            }`}
          />
        </div>
      </div>
    </aside>
  );
};

export default SidebarLeft;
