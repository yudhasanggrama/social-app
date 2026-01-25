import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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

const initialState: State = {
  followers: [],
  following: [],
  suggested: [],
  statusFollowers: "idle",
  statusFollowing: "idle",
  statusSuggested: "idle",
  error: null,
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
  reducers: {},
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
            s.following = a.payload;
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

      // ✅ reset saat logout
      .addCase(resetAll, () => initialState);
  },
});

export default slice.reducer;

export const selectFollowers = (s: RootState) => s.follow.followers;
export const selectFollowing = (s: RootState) => s.follow.following;
export const selectSuggested = (s: RootState) => s.follow.suggested;
