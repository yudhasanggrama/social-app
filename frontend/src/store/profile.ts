import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import type { RootState } from "./types";

export type Profile = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  cover_photo: string;
  bio: string;
  follower_count: number;
  following_count: number;
};

type Status = "idle" | "loading" | "succeeded" | "failed";

type ProfileState = {
  me: Profile | null;

  fetchStatus: Status;
  fetchError: string | null;

  updateStatus: Status;
  updateError: string | null;
};

const initialState: ProfileState = {
  me: null,

  fetchStatus: "idle",
  fetchError: null,

  updateStatus: "idle",
  updateError: null,
};

export const fetchMe = createAsyncThunk<Profile>(
  "profile/fetchMe",
  async () => {
    const res = await api.get("/me", { withCredentials: true });
    // sesuaikan kalau response kamu beda
    return res.data.user as Profile;
  }
);

export const updateMe = createAsyncThunk<
  Profile,
  Partial<Pick<Profile, "name" | "bio" | "avatar" | "cover_photo">>
>(
  "profile/updateMe",
  async (payload) => {
    const res = await api.patch("/me", payload, { withCredentials: true }); // ✅ pakai /me
    return res.data.user as Profile;
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    optimisticUpdateMe(state, action: PayloadAction<Partial<Profile>>) {
      if (!state.me) return;
      state.me = { ...state.me, ...action.payload };
    },
    clearMe(state) {
      state.me = null;

      state.fetchStatus = "idle";
      state.fetchError = null;

      state.updateStatus = "idle";
      state.updateError = null;
    },
  },

  // ✅ extraReducers harus di sini (bukan di dalam reducers)
  extraReducers: (builder) => {
    // ===== FETCH PROFILE =====
    builder.addCase(fetchMe.pending, (state) => {
      state.fetchStatus = "loading";
      state.fetchError = null;
    });

    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.fetchStatus = "succeeded";
      state.me = action.payload;
    });

    builder.addCase(fetchMe.rejected, (state, action) => {
      state.fetchStatus = "failed";
      state.fetchError = action.error.message ?? "Failed to fetch profile";
    });

    // ===== UPDATE PROFILE =====
    builder.addCase(updateMe.pending, (state) => {
      state.updateStatus = "loading";
      state.updateError = null;
    });

    builder.addCase(updateMe.fulfilled, (state, action) => {
      state.updateStatus = "succeeded";
      state.me = action.payload;
    });

    builder.addCase(updateMe.rejected, (state, action) => {
      state.updateStatus = "failed";
      state.updateError = action.error.message ?? "Failed to update profile";
    });
  },
});

export const { optimisticUpdateMe, clearMe } = profileSlice.actions;
export default profileSlice.reducer;

// ✅ selectors (retrieve)
export const selectMe = (s: RootState) => s.profile.me;

export const selectProfileFetchStatus = (s: RootState) => s.profile.fetchStatus;
export const selectProfileFetchError = (s: RootState) => s.profile.fetchError;

export const selectProfileUpdateStatus = (s: RootState) => s.profile.updateStatus;
export const selectProfileUpdateError = (s: RootState) => s.profile.updateError;

// helper selectors
export const selectIsProfileFetching = (s: RootState) => s.profile.fetchStatus === "loading";
export const selectIsProfileUpdating = (s: RootState) => s.profile.updateStatus === "loading";
