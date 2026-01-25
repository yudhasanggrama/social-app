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
import { selectMe } from "@/store/profile";

type Tab = "followers" | "following";

function Avatar({ src, name }: { src?: string; name: string }) {
  return (
    <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden flex items-center justify-center">
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-sm">{(name?.[0] ?? "U").toUpperCase()}</span>
      )}
    </div>
  );
}

export default function FollowsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const me = useSelector(selectMe);

  const [tab, setTab] = useState<Tab>("followers");

  const followers = useSelector(selectFollowers);
  const following = useSelector(selectFollowing);

  useEffect(() => {
    if (!me?.id) return;

    if (tab === "followers") dispatch(fetchFollowersThunk());
    else dispatch(fetchFollowingThunk());
  }, [dispatch, tab, me?.id]);

  const list = useMemo(
    () => (tab === "followers" ? followers : following),
    [tab, followers, following]
  );

  return (
    <div className="p-6">
      <div className="">
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4">
          <div className="font-semibold mb-4">Follows</div>

          <div className="grid grid-cols-2 border-b border-zinc-800 mb-4">
            <button
              className={`pb-3 text-sm text-center ${
                tab === "followers"
                  ? "border-b-2 border-green-500 text-white"
                  : "text-zinc-400"
              }`}
              onClick={() => setTab("followers")}
            >
              Followers
            </button>

            <button
              className={`pb-3 text-sm text-center ${
                tab === "following"
                  ? "border-b-2 border-green-500 text-white"
                  : "text-zinc-400"
              }`}
              onClick={() => setTab("following")}
            >
              Following
            </button>
          </div>




          {!me?.id ? (
            <div className="text-sm text-zinc-500">Login dulu untuk melihat data.</div>
          ) : (
            <div className="space-y-3">
              {list.map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={u.avatar} name={u.name} />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{u.name}</div>
                      <div className="text-sm text-zinc-400 truncate">
                        @{u.username}
                      </div>
                    </div>
                  </div>

                  <FollowButton userId={u.id} isFollowing={false} />
                </div>
              ))}

              {list.length === 0 && (
                <div className="text-sm text-zinc-500">No data.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
