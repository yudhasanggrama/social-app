import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store/index";
import api from "@/lib/api";
import { resetAll } from "@/store/index";

export type Profile = {
  id: number;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  follower_count?: number;
  following_count?: number;
};

type Status = "idle" | "loading" | "succeeded" | "failed";

type ProfileState = {
  me: Profile | null;
  fetchStatus: Status;
  fetchError: string | null;
  avatarVersion: number;
};

const initialState: ProfileState = {
  me: null,
  fetchStatus: "idle",
  fetchError: null,
  avatarVersion: 0,
};

export const fetchProfile = createAsyncThunk<
  Profile,
  void,
  { rejectValue: string }
>("profile/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/profile"); // ✅ sesuaikan endpoint kamu
    // contoh shape: { status:"success", data:{ profile: {...}} }
    const p = data?.data?.profile ?? data?.data?.user ?? data?.data ?? data?.profile;
    if (!p) return rejectWithValue("Profile not found");

    const mapped: Profile = {
      id: Number(p.id),
      username: p.username,
      name: p.name ?? p.full_name ?? p.fullName ?? "",
      avatar: p.avatar ?? p.photo_profile ?? "",
      bio: p.bio ?? "",
      follower_count: p.follower_count ?? p.followerCount ?? 0,
      following_count: p.following_count ?? p.followingCount ?? 0,
    };

    return mapped;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message ?? "Failed to fetch profile");
  }
});

const slice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchProfile.pending, (s) => {
        s.fetchStatus = "loading";
        s.fetchError = null;
      })
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.fetchStatus = "succeeded";
        s.me = a.payload;

        // ✅ penting: paksa avatar reload setelah login / switch account
        s.avatarVersion += 1;
      })
      .addCase(fetchProfile.rejected, (s, a) => {
        s.fetchStatus = "failed";
        s.fetchError = (a.payload as string) ?? "Failed";
        s.me = null;
      })

      // ✅ reset saat logout
      .addCase(resetAll, () => initialState);
  },
});

export default slice.reducer;

// selectors
export const selectMe = (s: RootState) => s.profile.me;
export const selectProfileFetchStatus = (s: RootState) => s.profile.fetchStatus;
export const selectProfileFetchError = (s: RootState) => s.profile.fetchError;
export const selectIsProfileLoading = (s: RootState) => s.profile.fetchStatus === "loading";
export const selectAvatarVersion = (s: RootState) => s.profile.avatarVersion;
