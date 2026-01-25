import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Camera, X } from "lucide-react";

import api from "@/lib/api";
import type { AppDispatch } from "@/store/types";
import {
  fetchProfile,
  selectAvatarVersion,
  selectMe,
  selectProfileFetchStatus,
} from "@/store/profile";

import PostRow from "@/components/posts/PostRow";
import { setThreadLikeFromServer } from "@/store/likes";
import type { Thread } from "@/Types/thread";
import { socket } from "@/lib/socket";
import { avatarImgSrc, publicUrl } from "@/lib/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";


type EditForm = {
  name: string;
  username: string;
  bio: string;
};

type LikeUpdatedPayload = {
  threadId: number | string;
  likes?: number | string;
  likesCount?: number | string;
  userId?: number | string;
  isLiked?: boolean;
  action?: "like" | "unlike";
};

const normalizeImages = (t: any): string[] => {
  if (Array.isArray(t?.image)) return t.image;
  if (Array.isArray(t?.images)) return t.images;
  if (typeof t?.image === "string" && t.image.length > 0) return [t.image];
  return [];
};

const toNumber = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();

  const me = useSelector(selectMe);
  const profileStatus = useSelector(selectProfileFetchStatus);

  const [tab, setTab] = useState<"posts" | "media">("posts");
  const [openEdit, setOpenEdit] = useState(false);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);

  const [form, setForm] = useState<EditForm>({
    name: "",
    username: "",
    bio: "",
  });

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    avatarImgSrc(me?.avatar)
  );
  const displayName = me?.name ?? "Guest";
  const fallback = (displayName?.[0] ?? "U").toUpperCase();
  const v = useSelector(selectAvatarVersion);
  const src = me?.avatar ? avatarImgSrc(me.avatar, v) : "https://github.com/shadcn.png";

  useEffect(() => {
    if (!me && profileStatus !== "loading") {
      dispatch(fetchProfile());
    }
  }, [dispatch, me, profileStatus]);

  // fetch my threads
  useEffect(() => {
    const run = async () => {
      setLoadingThreads(true);
      try {
        const res = await api.get("/threads/me", { withCredentials: true });
        const list: Thread[] = res.data?.data?.threads ?? res.data?.threads ?? [];
        setThreads(list);

        list.forEach((t) => {
          dispatch(
            setThreadLikeFromServer({
              threadId: Number((t as any).id),
              isLiked: Boolean((t as any).isLiked),
              likesCount: toNumber((t as any).likes),
            })
          );
        });
      } catch {
        setThreads([]);
      } finally {
        setLoadingThreads(false);
      }
    };

    run();
  }, [dispatch]);
  
  useEffect(() => {
    if (!openEdit) return;

    setForm({
      name: me?.name ?? "",
      username: me?.username ?? "",
      bio: me?.bio ?? "",
    });

    setAvatarFile(null);
    setAvatarPreview(avatarImgSrc(me?.avatar));
  }, [openEdit, me]);

  useEffect(() => {
    if (!me?.id) return;

    if (socket && (socket as any).connected === false) {
      try {
        socket.connect?.();
      } catch {}
    }

    const onThreadCreated = (payload: any) => {
      const t = payload?.thread ?? payload;
      if (!t) return;

      const authorId = toNumber(
        t?.userId ?? t?.authorId ?? t?.user?.id ?? t?.User?.id
      );
      if (authorId !== toNumber(me.id)) return;

      setThreads((prev) => {
        const exists = prev.some((x: any) => Number(x.id) === Number(t.id));
        if (exists) return prev;
        return [t as Thread, ...prev];
      });

      dispatch(
        setThreadLikeFromServer({
          threadId: Number(t.id),
          isLiked: Boolean(t?.isLiked),
          likesCount: toNumber(t?.likes),
        })
      );
    };

    const onThreadUpdated = (payload: any) => {
      const t = payload?.thread ?? payload;
      if (!t?.id) return;

      setThreads((prev) =>
        prev.map((x: any) =>
          Number(x.id) === Number(t.id) ? { ...x, ...t } : x
        )
      );

      if (t?.likes !== undefined || t?.isLiked !== undefined) {
        dispatch(
          setThreadLikeFromServer({
            threadId: Number(t.id),
            isLiked: Boolean(t?.isLiked),
            likesCount: toNumber(t?.likes),
          })
        );
      }
    };

    const onThreadDeleted = (payload: any) => {
      const threadId = payload?.threadId ?? payload?.id ?? payload;
      if (threadId == null) return;
      setThreads((prev) =>
        prev.filter((x: any) => Number(x.id) !== Number(threadId))
      );
    };

    const onLikeUpdated = (payload: LikeUpdatedPayload) => {
      const threadId = toNumber(payload?.threadId);
      if (!threadId) return;

      const likesCount =
        payload?.likes !== undefined
          ? toNumber(payload.likes)
          : payload?.likesCount !== undefined
          ? toNumber(payload.likesCount)
          : undefined;

      const actorUserId = payload?.userId != null ? toNumber(payload.userId) : null;
      const actorIsMe = actorUserId != null && actorUserId === toNumber(me.id);

      setThreads((prev) =>
        prev.map((t: any) => {
          if (Number(t.id) !== threadId) return t;
          const next: any = { ...t };
          if (likesCount !== undefined) next.likes = likesCount;
          if (actorIsMe && typeof payload.isLiked === "boolean") {
            next.isLiked = payload.isLiked;
          }
          return next;
        })
      );

      dispatch(
        setThreadLikeFromServer({
          threadId,
          isLiked: actorIsMe ? Boolean(payload.isLiked) : false,
          likesCount: likesCount ?? 0,
        })
      );
    };

    socket.on("thread:created", onThreadCreated);
    socket.on("thread:updated", onThreadUpdated);
    socket.on("thread:deleted", onThreadDeleted);
    socket.on("thread:likeUpdated", onLikeUpdated);
    socket.on("thread:like", onLikeUpdated);
    socket.on("like:updated", onLikeUpdated);

    return () => {
      socket.off("thread:created", onThreadCreated);
      socket.off("thread:updated", onThreadUpdated);
      socket.off("thread:deleted", onThreadDeleted);
      socket.off("thread:likeUpdated", onLikeUpdated);
      socket.off("thread:like", onLikeUpdated);
      socket.off("like:updated", onLikeUpdated);
    };
  }, [dispatch, me?.id]);

  const mediaImages = useMemo(() => {
    const all: string[] = [];
    for (const t of threads as any[]) {
      const imgs = normalizeImages(t)
        .map((p) => publicUrl(p))
        .filter((x): x is string => Boolean(x));
      all.push(...imgs);
    }
    return all;
  }, [threads]);

  const coverStyle = {
    background:
      "linear-gradient(90deg, rgba(74,222,128,0.85), rgba(253,224,71,0.85))",
  };

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

      if (newAvatar) {
        setThreads((prev) =>
          prev.map((t: any) => ({
            ...t,
            user: t.user ? { ...t.user, avatar: newAvatar } : t.user,
            User: t.User ? { ...t.User, avatar: newAvatar } : t.User,
          }))
        );
      }

      setOpenEdit(false);
    } catch (e) {
      console.error(e);
      alert("Gagal update profile");
    }
  };


  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="sticky top-0 z-10 border-b border-zinc-800 bg-black/70 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <button className="rounded-full p-2 hover:bg-zinc-900">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-sm font-semibold">{me?.name ?? "My Profile"}</div>
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* cover */}
        <div
          className="mt-4 h-36 w-full rounded-2xl border border-zinc-800"
          style={coverStyle}
        />

        {/* avatar + edit */}
        <div className="-mt-10 flex items-end justify-between px-2">
          <Avatar className="h-20 w-20 border-4 border-black">
            <AvatarImage
              src={src}
              onError={(e) => (e.currentTarget.src = "https://github.com/shadcn.png")}
            />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>

          <button
            onClick={() => setOpenEdit(true)}
            className="rounded-full border border-white/60 px-4 py-1 text-sm hover:bg-white/10"
          >
            Edit Profile
          </button>
        </div>

        {/* info */}
        <div className="mt-3 px-2">
          <div className="text-xl font-bold">{me?.name ?? "Guest"}</div>
          <div className="text-sm text-zinc-400">@{me?.username ?? "guest"}</div>

          <div className="mt-2 text-sm text-zinc-300">{me?.bio ?? ""}</div>

          <div className="mt-2 flex gap-4 text-sm">
            <span>
              <b>{(me as any)?.following_count ?? 0}</b>{" "}
              <span className="text-zinc-400">Following</span>
            </span>
            <span>
              <b>{(me as any)?.follower_count ?? 0}</b>{" "}
              <span className="text-zinc-400">Followers</span>
            </span>
          </div>
        </div>

        {/* tabs */}
        <div className="mt-5 border-b border-zinc-800">
          <div className="flex">
            <button
              onClick={() => setTab("posts")}
              className={`flex-1 py-3 text-sm ${
                tab === "posts"
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="mx-auto w-fit">All Post</div>
              {tab === "posts" && (
                <div className="mx-auto mt-2 h-[2px] w-40 bg-green-500" />
              )}
            </button>

            <button
              onClick={() => setTab("media")}
              className={`flex-1 py-3 text-sm ${
                tab === "media"
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="mx-auto w-fit">Media</div>
              {tab === "media" && (
                <div className="mx-auto mt-2 h-[2px] w-40 bg-green-500" />
              )}
            </button>
          </div>
        </div>

        {/* tab content */}
        {tab === "posts" ? (
          <div className="pt-4">
            {loadingThreads ? (
              <div className="space-y-4 px-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 border-b border-zinc-800 pb-4">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-800" />
                    <div className="flex-1">
                      <div className="h-4 w-40 animate-pulse rounded bg-zinc-800" />
                      <div className="mt-2 h-3 w-full animate-pulse rounded bg-zinc-800" />
                      <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {threads.map((t) => (
                  <PostRow key={(t as any).id} thread={t} />
                ))}
                {threads.length === 0 && (
                  <div className="px-2 py-8 text-sm text-zinc-400">
                    Belum ada post.
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="pt-4">
            {loadingThreads ? (
              <div className="grid grid-cols-3 gap-2 px-2 pb-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-xl bg-zinc-800" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 px-2 pb-6">
                {mediaImages.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="overflow-hidden rounded-xl border border-zinc-800"
                  >
                    <img
                      src={src}
                      alt={`media-${i}`}
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                ))}

                {mediaImages.length === 0 && (
                  <div className="col-span-3 py-10 text-center text-sm text-zinc-400">
                    Belum ada media.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {openEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-[560px] rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="text-lg font-semibold">Edit profile</div>
              <button
                onClick={() => setOpenEdit(false)}
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
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-zinc-400">
                    Username
                  </label>
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
                    onChange={(e) =>
                      setForm((p) => ({ ...p, bio: e.target.value }))
                    }
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
      )}
    </div>
  );
}
