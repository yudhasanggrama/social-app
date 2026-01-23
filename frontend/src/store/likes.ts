import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import type { RootState } from "./types";

type LikeInfo = { isLiked: boolean; likesCount: number };

type LikesState = {
  thread: Record<number, LikeInfo>;
  reply: Record<number, LikeInfo>;
  pending: Record<string, boolean>;
};

const initialState: LikesState = {
  thread: {},
  reply: {},
  pending: {},
};

// --- DB sync (toggle => create/delete di DB) ---
export const toggleThreadLike = createAsyncThunk(
  "likes/toggleThreadLike",
  async (threadId: number) => {
    const res = await api.post(
      "/likes/toggle",
      { thread_id: threadId },
      { withCredentials: true }
    );

    const liked = res.data?.result?.liked ?? res.data?.data?.liked;
    const likesCount = res.data?.result?.likesCount ?? res.data?.data?.likesCount;

    return { threadId, liked: Boolean(liked), likesCount: Number(likesCount) };
  }
);

export const toggleReplyLike = createAsyncThunk(
  "likes/toggleReplyLike",
  async (replyId: number) => {
    const res = await api.post(
      "/reply-likes/toggle",
      { reply_id: replyId },
      { withCredentials: true }
    );

    const liked = res.data?.result?.liked ?? res.data?.data?.liked;
    const likesCount = res.data?.result?.likesCount ?? res.data?.data?.likesCount;

    return { replyId, liked: Boolean(liked), likesCount: Number(likesCount) };
  }
);

const likesSlice = createSlice({
  name: "likes",
  initialState,
  reducers: {
    // Seed data dari API
    setThreadLikeFromServer(
      state,
      action: PayloadAction<{ threadId: number; isLiked: boolean; likesCount: number }>
    ) {
      state.thread[action.payload.threadId] = {
        isLiked: action.payload.isLiked,
        likesCount: action.payload.likesCount,
      };
    },
    setReplyLikeFromServer(
      state,
      action: PayloadAction<{ replyId: number; isLiked: boolean; likesCount: number }>
    ) {
      state.reply[action.payload.replyId] = {
        isLiked: action.payload.isLiked,
        likesCount: action.payload.likesCount,
      };
    },

    // Optimistic update
    optimisticToggleThread(state, action: PayloadAction<{ threadId: number }>) {
      const { threadId } = action.payload;
      const cur = state.thread[threadId] ?? { isLiked: false, likesCount: 0 };

      state.thread[threadId] = {
        isLiked: !cur.isLiked,
        likesCount: cur.isLiked ? Math.max(0, cur.likesCount - 1) : cur.likesCount + 1,
      };

      state.pending[`thread:${threadId}`] = true;
    },

    optimisticToggleReply(state, action: PayloadAction<{ replyId: number }>) {
      const { replyId } = action.payload;
      const cur = state.reply[replyId] ?? { isLiked: false, likesCount: 0 };

      state.reply[replyId] = {
        isLiked: !cur.isLiked,
        likesCount: cur.isLiked ? Math.max(0, cur.likesCount - 1) : cur.likesCount + 1,
      };

      state.pending[`reply:${replyId}`] = true;
    },

    // Rollback kalau request gagal
    rollbackThread(state, action: PayloadAction<{ threadId: number; prev: LikeInfo }>) {
      state.thread[action.payload.threadId] = action.payload.prev;
      state.pending[`thread:${action.payload.threadId}`] = false;
    },

    rollbackReply(state, action: PayloadAction<{ replyId: number; prev: LikeInfo }>) {
      state.reply[action.payload.replyId] = action.payload.prev;
      state.pending[`reply:${action.payload.replyId}`] = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(toggleThreadLike.fulfilled, (state, action) => {
        const { threadId, liked, likesCount } = action.payload;

        state.thread[threadId] = { isLiked: liked, likesCount };
        state.pending[`thread:${threadId}`] = false;
      })
      .addCase(toggleReplyLike.fulfilled, (state, action) => {
        const { replyId, liked, likesCount } = action.payload;

        state.reply[replyId] = { isLiked: liked, likesCount };
        state.pending[`reply:${replyId}`] = false;
      });
  },
});

export const {
  setThreadLikeFromServer,
  setReplyLikeFromServer,
  optimisticToggleThread,
  optimisticToggleReply,
  rollbackThread,
  rollbackReply,
} = likesSlice.actions;

export default likesSlice.reducer;

// selectors
export const selectThreadLike = (threadId: number) => (s: RootState) =>
  s.likes.thread[threadId] ?? { isLiked: false, likesCount: 0 };

export const selectReplyLike = (replyId: number) => (s: RootState) =>
  s.likes.reply[replyId] ?? { isLiked: false, likesCount: 0 };

export const selectLikePending = (key: string) => (s: RootState) => Boolean(s.likes.pending[key]);
