import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/index";
import { followsApi } from "@/services/follows";
import { resetAll } from "@/store/index";

export type FollowUserItem = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  is_following?: boolean;
};

type Status = "idle" | "loading" | "succeeded" | "failed";

type State = {
  followers: FollowUserItem[];
  following: FollowUserItem[];
  suggested: FollowUserItem[];

  statusFollowers: Status;
  statusFollowing: Status;
  statusSuggested: Status;

  error: string | null;
};

export type SocketFollowChangedPayload = {
  followerId: number;
  targetUserId: number;
  isFollowing: boolean;
};

const initialState: State = {
  followers: [],
  following: [],
  suggested: [],
  statusFollowers: "idle",
  statusFollowing: "idle",
  statusSuggested: "idle",
  error: null,
};

const patchIsFollowing = (arr: FollowUserItem[], targetId: number, val: boolean) => {
  const idStr = String(targetId);
  const i = arr.findIndex((x) => x.id === idStr);
  if (i !== -1) arr[i] = { ...arr[i], is_following: val };
};

export const fetchFollowersThunk = createAsyncThunk<
  FollowUserItem[],
  void,
  { rejectValue: string }
>("follow/fetchFollowers", async (_, { rejectWithValue }) => {
  try {
    const res = await followsApi.followers();
    if (res.status === "error") return rejectWithValue(res.message);
    return res.data.followers;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message ?? "Failed to fetch followers");
  }
});

export const fetchFollowingThunk = createAsyncThunk<
  FollowUserItem[],
  void,
  { rejectValue: string }
>("follow/fetchFollowing", async (_, { rejectWithValue }) => {
  try {
    const res = await followsApi.following();
    if (res.status === "error") return rejectWithValue(res.message);
    return res.data.followers; // backend kamu pakai key followers juga
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message ?? "Failed to fetch following");
  }
});

export const fetchSuggestedThunk = createAsyncThunk<
  FollowUserItem[],
  number,
  { rejectValue: string }
>("follow/fetchSuggested", async (limit, { rejectWithValue }) => {
  try {
    const res = await followsApi.suggested(limit);
    if (res.status === "error") return rejectWithValue(res.message);
    return res.data.users;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message ?? "Failed to fetch suggested");
  }
});

export const followThunk = createAsyncThunk<
  boolean,
  number,
  { rejectValue: string }
>("follow/follow", async (id, { rejectWithValue }) => {
  try {
    const res = await followsApi.follow(id);
    if (res.status === "error") return rejectWithValue(res.message);
    return true;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message ?? "Failed to follow");
  }
});

export const unfollowThunk = createAsyncThunk<
  boolean,
  number,
  { rejectValue: string }
>("follow/unfollow", async (id, { rejectWithValue }) => {
  try {
    const res = await followsApi.unfollow(id);
    if (res.status === "error") return rejectWithValue(res.message);
    return true;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message ?? "Failed to unfollow");
  }
});

const slice = createSlice({
  name: "follow",
  initialState,

  reducers: {
  followChanged: (s, a) => {
    const { followerId, targetUserId, isFollowing, followerUser } = a.payload;

    const fid = String(followerId);
    const tid = String(targetUserId);

  // ===== CASE 1: AKU ADALAH TARGET (followers-ku berubah)
    if (String(s.meId) === tid) {
      if (isFollowing) {
        // ✅ orang baru follow aku → add ke followers
        const exists = s.followers.some((u) => u.id === fid);
        if (!exists && followerUser) {
          s.followers = [
            { ...followerUser, is_following: false },
            ...s.followers,
          ];
        }
      } else {
        // ✅ orang unfollow aku → remove dari followers
        s.followers = s.followers.filter((u) => u.id !== fid);
      }
    }

  // ===== CASE 2: AKU ADALAH FOLLOWER (status following-ku berubah)
    if (String(s.meId) === fid) {
      patchIsFollowing(s.following, Number(tid), isFollowing);
      patchIsFollowing(s.suggested, Number(tid), isFollowing);
      }
    },
},

  extraReducers: (b) => {
    b
      .addCase(fetchFollowersThunk.pending, (s) => {
        s.statusFollowers = "loading";
        s.error = null;
      })
      .addCase(fetchFollowersThunk.fulfilled, (s, a) => {
        s.statusFollowers = "succeeded";
        s.followers = a.payload;
      })
      .addCase(fetchFollowersThunk.rejected, (s, a) => {
        s.statusFollowers = "failed";
        s.error = (a.payload as string) ?? "Failed";
      })

      .addCase(fetchFollowingThunk.pending, (s) => {
        s.statusFollowing = "loading";
        s.error = null;
      })
      .addCase(fetchFollowingThunk.fulfilled, (s, a) => {
        s.statusFollowing = "succeeded";

        // penting: following list harus true
        s.following = a.payload.map((u) => ({ ...u, is_following: true }));
      })
      .addCase(fetchFollowingThunk.rejected, (s, a) => {
        s.statusFollowing = "failed";
        s.error = (a.payload as string) ?? "Failed";
      })

      .addCase(fetchSuggestedThunk.pending, (s) => {
        s.statusSuggested = "loading";
        s.error = null;
      })
      .addCase(fetchSuggestedThunk.fulfilled, (s, a) => {
        s.statusSuggested = "succeeded";
        s.suggested = a.payload;
      })
      .addCase(fetchSuggestedThunk.rejected, (s, a) => {
        s.statusSuggested = "failed";
        s.error = (a.payload as string) ?? "Failed";
      })

      .addCase(followThunk.pending, (s, a) => {
        const targetIdNum = a.meta.arg;
        const targetId = String(targetIdNum);

        // ambil user dari suggested
        const picked = s.suggested.find((x) => x.id === targetId);

        patchIsFollowing(s.followers, targetIdNum, true);
        patchIsFollowing(s.following, targetIdNum, true);
        patchIsFollowing(s.suggested, targetIdNum, true);

        // remove dari suggested
        s.suggested = s.suggested.filter((x) => x.id !== targetId);

        // ✅ masukin ke following (REALTIME)
        if (picked) {
          const exists = s.following.some((x) => x.id === targetId);
          if (!exists) {
            s.following = [
              { ...picked, is_following: true },
              ...s.following,
            ];
          }
        }
      })


      .addCase(followThunk.rejected, (s, a) => {
        const targetId = a.meta.arg;

        patchIsFollowing(s.followers, targetId, false);
        patchIsFollowing(s.following, targetId, false);
        patchIsFollowing(s.suggested, targetId, false);

        s.error = (a.payload as string) ?? "Failed to follow";
      })

      .addCase(unfollowThunk.pending, (s, a) => {
        const targetIdNum = a.meta.arg;
        const targetId = String(targetIdNum);
        const removed = s.following.find((x) => x.id === targetId);

        patchIsFollowing(s.followers, targetIdNum, false);
        patchIsFollowing(s.following, targetIdNum, false);
        patchIsFollowing(s.suggested, targetIdNum, false);

        s.following = s.following.filter((x) => x.id !== targetId);

        if (removed) {
          const exists = s.suggested.some((x) => x.id === targetId);
          if (!exists) {
            s.suggested = [
              { ...removed, is_following: false },
              ...s.suggested,
            ].slice(0, 5); // optional: cap limit suggested
          }
        }
      })




      .addCase(unfollowThunk.rejected, (s, a) => {
        const targetId = a.meta.arg;

        // rollback
        patchIsFollowing(s.followers, targetId, true);
        patchIsFollowing(s.following, targetId, true);
        patchIsFollowing(s.suggested, targetId, true);

        s.error = (a.payload as string) ?? "Failed to unfollow";
      })

      // reset saat logout
      .addCase(resetAll, () => initialState);
  },
});

export const { followChanged } = slice.actions;
export default slice.reducer;

export const selectFollowers = (s: RootState) => s.follow.followers;
export const selectFollowing = (s: RootState) => s.follow.following;
export const selectSuggested = (s: RootState) => s.follow.suggested;
