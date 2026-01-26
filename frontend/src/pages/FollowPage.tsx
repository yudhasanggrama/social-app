import { useEffect, useMemo, useState } from "react";
import FollowButton from "@/components/FollowButton";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/types";
import {
  fetchFollowersThunk,
  fetchFollowingThunk,
  selectFollowers,
  selectFollowing,
} from "@/store/follow";
import { selectAvatarVersion, selectMe } from "@/store/profile";
import { avatarImgSrc } from "@/lib/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Tab = "followers" | "following";

export default function FollowPage() {
  const dispatch = useDispatch<AppDispatch>();
  const me = useSelector(selectMe);
  const avatarVersion = useSelector(selectAvatarVersion);

  const [tab, setTab] = useState<Tab>("followers");

  const followers = useSelector(selectFollowers);
  const following = useSelector(selectFollowing);

  useEffect(() => {
    if (!me?.id) return;
    tab === "followers"
      ? dispatch(fetchFollowersThunk())
      : dispatch(fetchFollowingThunk());
  }, [dispatch, tab, me?.id]);

  const list = useMemo(
    () => (tab === "followers" ? followers : following),
    [tab, followers, following]
  );

  // ✅ local list supaya unfollow langsung hilang dari UI tanpa nunggu fetch
  const [localList, setLocalList] = useState<any[]>([]);
  useEffect(() => setLocalList(list as any[]), [list]);

  return (
    <div className="p-6">
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4">
        <div className="font-semibold mb-4">Follows</div>

        <div className="grid grid-cols-2 border-b border-zinc-800 mb-4">
          <button
            onClick={() => setTab("followers")}
            className={`pb-3 text-sm ${
              tab === "followers"
                ? "border-b-2 border-green-500 text-white"
                : "text-zinc-400"
            }`}
          >
            Followers
          </button>
          <button
            onClick={() => setTab("following")}
            className={`pb-3 text-sm ${
              tab === "following"
                ? "border-b-2 border-green-500 text-white"
                : "text-zinc-400"
            }`}
          >
            Following
          </button>
        </div>

        {!me?.id ? (
          <div className="text-sm text-zinc-500">Login dulu untuk melihat data.</div>
        ) : (
          <div className="space-y-3">
            {localList.map((u: any) => {
              const img = avatarImgSrc(u.avatar, avatarVersion);
              const fallback = (u.name?.[0] ?? "U").toUpperCase();

              const isFollowing =
                tab === "following" ? true : (u.is_following ?? false);

              return (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={avatarImgSrc(u.avatar, avatarVersion)}
                          alt={u.name}
                        />
                        <AvatarFallback>{(u.name?.[0] ?? "U").toUpperCase()}</AvatarFallback>
                      </Avatar>

                      {!img && <span className="text-sm text-white">{fallback}</span>}
                    </div>

                    <div className="min-w-0">
                      <div className="font-medium truncate">{u.name}</div>
                      <div className="text-sm text-zinc-400 truncate">@{u.username}</div>
                    </div>
                  </div>

                  <FollowButton
                    userId={u.id}
                    isFollowing={isFollowing}
                    onToggle={(next) => {
                      // ✅ kalau di tab following dan next=false => remove dari list
                      if (tab === "following" && !next) {
                        setLocalList((prev) => prev.filter((x) => x.id !== u.id));
                      }

                      // ✅ kalau di followers tab, cukup patch flag lokal
                      if (tab === "followers") {
                        setLocalList((prev) =>
                          prev.map((x) =>
                            x.id === u.id ? { ...x, is_following: next } : x
                          )
                        );
                      }
                    }}
                  />
                </div>
              );
            })}

            {localList.length === 0 && (
              <div className="text-sm text-zinc-500">No data.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
