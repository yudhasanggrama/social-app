import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { toggleLike } from "../services/like";
import { io } from "../app"; // sesuaikan path

export const toggle = async (req: AuthRequest, res: Response) => {
  try {
    const threadId = Number(req.body.thread_id);
    const userId = req.user?.id;

    if (!userId || Number.isNaN(threadId) || threadId <= 0) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // result contoh: { threadId, likesCount, liked }
    const result = await toggleLike(userId, threadId);

    // response REST (optional)
    res.status(200).json({ result });

    // ✅ 1) Broadcast ke semua: COUNT SAJA (tanpa userId, tanpa isLiked)
    io.emit("thread:like_updated", {
      threadId: result.threadId,
      likesCount: result.likesCount,
    });

    // ✅ 2) Private ke user pelaku: isLiked (+count biar konsisten)
    io.to(`user:${userId}`).emit("thread:like_updated", {
      threadId: result.threadId,
      likesCount: result.likesCount,
      isLiked: result.liked,
    });
  } catch (e) {
    console.error("[toggleLike] error:", e);
    return res.status(500).json({ message: "Failed to toggle like" });
  }
};
