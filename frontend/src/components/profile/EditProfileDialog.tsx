import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import api from "@/lib/api";
import type { AppDispatch } from "@/store/types";
import { fetchProfile, selectMe } from "@/store/profile";
import { avatarImgSrc } from "@/lib/image";

type EditForm = {
  name: string;
  username: string;
  bio: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coverStyle?: React.CSSProperties;
  onAvatarUpdated?: (newAvatar: string) => void; // optional: sync ke thread list
};

export default function EditProfileDialog({
  open,
  onOpenChange,
  coverStyle,
  onAvatarUpdated,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const me = useSelector(selectMe);

  const [form, setForm] = useState<EditForm>({ name: "", username: "", bio: "" });
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(avatarImgSrc(me?.avatar));
  

  useEffect(() => {
    if (!open) return;

    setForm({
      name: me?.name ?? "",
      username: me?.username ?? "",
      bio: me?.bio ?? "",
    });

    setAvatarFile(null);
    setAvatarPreview(avatarImgSrc(me?.avatar));
  }, [open, me]);

  const handleSaveProfile = async () => {
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("username", form.username);
      fd.append("bio", form.bio);
      if (avatarFile) fd.append("avatar", avatarFile);

      const res = await api.patch("/profile", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated =
        res.data?.data?.profile ??
        res.data?.data?.user ??
        res.data?.data ??
        res.data?.profile ??
        res.data?.user ??
        res.data;

      const newAvatar: string | undefined = updated?.avatar;

      dispatch(fetchProfile());

      if (newAvatar) onAvatarUpdated?.(newAvatar);

      onOpenChange(false);
    } catch (e) {
      console.error(e);
      alert("Gagal update profile");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-[560px] rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl text-white">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="text-lg font-semibold">Edit profile</div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 hover:bg-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pb-5">
          <div
            className="h-28 w-full rounded-2xl border border-zinc-800"
            style={coverStyle}
          />

          <div className="-mt-8 relative w-fit">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative"
              title="Ganti foto profil"
            >
              <img
                src={avatarPreview}
                className="h-16 w-16 rounded-full border-4 border-zinc-950 object-cover"
              />
              <div className="absolute inset-0 rounded-full bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setAvatarFile(file);
                setAvatarPreview(URL.createObjectURL(file));
              }}
            />
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-400">Username</label>
              <input
                value={form.username}
                onChange={(e) =>
                  setForm((p) => ({ ...p, username: e.target.value }))
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-400">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                rows={4}
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                className="rounded-full bg-green-500 px-6 py-2 text-sm font-semibold text-black hover:bg-green-600"
                onClick={handleSaveProfile}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
