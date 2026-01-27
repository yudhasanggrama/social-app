import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";

import api from "@/lib/api";
import { socket } from "@/lib/socket";
import { avatarImgSrc, publicUrl } from "@/lib/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostRow from "@/components/posts/PostRow";
import { selectAvatarVersion, selectMe } from "@/store/profile";
import FollowButton from "@/components/FollowButton";

type PublicProfile = {
    id: string;
    username: string;
    name: string;
    avatar: string;
    bio: string;
    follower_count: number;
    following_count: number;
    is_following: boolean;
};

export default function UserProfilePage() {
    const { username } = useParams();
    const nav = useNavigate();

    const me = useSelector(selectMe);
    const v = useSelector(selectAvatarVersion);

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [threads, setThreads] = useState<any[]>([]);
    const [loadingThreads, setLoadingThreads] = useState(true);

    const [tab, setTab] = useState<"posts" | "media">("posts");

    const isMe = profile?.id && me?.id ? String(profile.id) === String(me.id) : false;

    // fetch public profile by username
    useEffect(() => {
        const run = async () => {
        setLoadingProfile(true);
        try {
            const res = await api.get(`/users/${username}`, { withCredentials: true });
            setProfile(res.data?.data ?? null);
        } catch {
            setProfile(null);
        } finally {
            setLoadingProfile(false);
        }
        };
        if (username) run();
    }, [username]);

    // kalau buka profile sendiri -> MyProfilePage
    useEffect(() => {
        if (isMe) nav("/profile");
    }, [isMe, nav]);

    // fetch user threads
    useEffect(() => {
        const run = async () => {
        if (!profile?.id) return;
        setLoadingThreads(true);
        try {
            const res = await api.get(`/threads/user/${profile.id}`, { withCredentials: true });
            setThreads(res.data?.data?.threads ?? []);
        } catch {
            setThreads([]);
        } finally {
            setLoadingThreads(false);
        }
        };
        run();
    }, [profile?.id]);

    // realtime follow changes untuk profile ini
    useEffect(() => {
        if (!profile?.id) return;

        const handler = (p: any) => {
        const targetUserId = String(p?.targetUserId ?? "");
        const followerId = String(p?.followerId ?? "");
        const isFollowing = Boolean(p?.isFollowing);

        if (targetUserId !== String(profile.id)) return;

        // update button state kalau aku yang follow/unfollow
        if (me?.id && followerId === String(me.id)) {
            setProfile((prev) => {
            if (!prev) return prev;
            return { ...prev, is_following: isFollowing };
            });
        }

        // update followers count untuk profile ini
        setProfile((prev) => {
            if (!prev) return prev;
            const delta = isFollowing ? 1 : -1;
            const nextCount = Math.max(0, Number(prev.follower_count ?? 0) + delta);
            return { ...prev, follower_count: nextCount };
        });
        };

        socket.on("follow:changed", handler);
        return () => {
        socket.off("follow:changed", handler);
        };
    }, [profile?.id, me?.id]);

    const avatarSrc = profile?.avatar
        ? avatarImgSrc(profile.avatar, v)
        : "https://github.com/shadcn.png";

    // ✅ TANPA type-predicate filter biar TS kamu tidak error
    const mediaImages = useMemo(() => {
        const all: string[] = [];
        for (const t of threads) {
        const imgs = Array.isArray((t as any)?.image) ? (t as any).image : [];
        for (const p of imgs) {
            const u = publicUrl(p);
            if (typeof u === "string" && u.length > 0) all.push(u);
        }
        }
        return all;
    }, [threads]);

        const coverStyle = {
            background: "linear-gradient(90deg, rgba(74,222,128,0.85), rgba(253,224,71,0.85))",
        };

        if (!loadingProfile && !profile) {
        return (
        <div className="min-h-screen bg-black text-white">
            <div className="sticky top-0 z-10 border-b border-zinc-800 bg-black/70 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => nav(-1)} className="rounded-full p-2 hover:bg-zinc-900">
                <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="text-sm font-semibold">Profile</div>
            </div>
            </div>
            <div className="px-4 py-10 text-sm text-zinc-400">User tidak ditemukan.</div>
        </div>
        );
    }

        return (
        <div className="min-h-screen bg-black text-white">
        {/* header */}
        <div className="sticky top-0 z-10 border-b border-zinc-800 bg-black/70 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => nav(-1)} className="rounded-full p-2 hover:bg-zinc-900">
                <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-sm font-semibold">{profile?.name ?? "Profile"}</div>
            </div>
        </div>

        <div className="px-4 pb-4">
            <div className="mt-4 h-36 w-full rounded-2xl border border-zinc-800" style={coverStyle} />

            <div className="-mt-10 flex items-end justify-between px-2">
            <Avatar className="h-20 w-20 border-4 border-black">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback>{(profile?.name?.[0] ?? "U").toUpperCase()}</AvatarFallback>
            </Avatar>

            {/* ✅ Follow/Unfollow pakai FollowButton (biar redux follow.ts update suggested) */}
            {!loadingProfile && profile && !isMe && (
                <FollowButton
                userId={profile.id}
                isFollowing={profile.is_following}
                user={{
                    id: profile.id,
                    username: profile.username,
                    name: profile.name,
                    avatar: profile.avatar ?? "",
                    is_following: profile.is_following,
                }}
                onToggle={(next) => {
                    setProfile((prev) => {
                    if (!prev) return prev;
                    const delta = next ? 1 : -1;
                    return {
                        ...prev,
                        is_following: next,
                        follower_count: Math.max(0, Number(prev.follower_count ?? 0) + delta),
                    };
                    });
                }}
                />
            )}
            </div>

            <div className="mt-3 px-2">
            {loadingProfile ? (
                <div className="space-y-2">
                <div className="h-5 w-48 animate-pulse rounded bg-zinc-800" />
                <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
                <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
                </div>
            ) : (
                <>
                <div className="text-xl font-bold">{profile?.name}</div>
                <div className="text-sm text-zinc-400">@{profile?.username}</div>
                {!!profile?.bio && <div className="mt-2 text-sm text-zinc-300">{profile.bio}</div>}

                <div className="mt-2 flex gap-4 text-sm">
                    <span>
                    <b>{profile?.following_count ?? 0}</b>{" "}
                    <span className="text-zinc-400">Following</span>
                    </span>
                    <span>
                    <b>{profile?.follower_count ?? 0}</b>{" "}
                    <span className="text-zinc-400">Followers</span>
                    </span>
                </div>
                </>
            )}
            </div>

            {/* tabs */}
            <div className="mt-5 border-b border-zinc-800">
            <div className="flex">
                <button
                onClick={() => setTab("posts")}
                className={`flex-1 py-3 text-sm ${
                    tab === "posts" ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
                >
                <div className="mx-auto w-fit">All Post</div>
                {tab === "posts" && <div className="mx-auto mt-2 h-[2px] w-40 bg-green-500" />}
                </button>

                <button
                onClick={() => setTab("media")}
                className={`flex-1 py-3 text-sm ${
                    tab === "media" ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
                >
                <div className="mx-auto w-fit">Media</div>
                {tab === "media" && <div className="mx-auto mt-2 h-[2px] w-40 bg-green-500" />}
                </button>
            </div>
            </div>

            {/* content */}
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
                <>
                    {threads.map((t) => (
                    <PostRow key={String((t as any).id)} thread={t as any} />
                    ))}
                    {threads.length === 0 && (
                    <div className="px-2 py-8 text-sm text-zinc-400">Belum ada post.</div>
                    )}
                </>
                )}
            </div>
            ) : (
            <div className="pt-4">
                <div className="grid grid-cols-3 gap-2 px-2 pb-6">
                {mediaImages.map((src, i) => (
                    <div key={`${src}-${i}`} className="overflow-hidden rounded-xl border border-zinc-800">
                    <img src={src} alt={`media-${i}`} className="aspect-square w-full object-cover" />
                    </div>
                ))}

                {!loadingThreads && mediaImages.length === 0 && (
                    <div className="col-span-3 py-10 text-center text-sm text-zinc-400">
                    Belum ada media.
                    </div>
                )}
                </div>
            </div>
            )}
        </div>
        </div>
    );
}
