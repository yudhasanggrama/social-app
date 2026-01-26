import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { toggleLike } from "../services/like";
import { io } from "../app"; // sesuaikan path

export const toggle = async (req: AuthRequest, res: Response) => {
  try {
    const { thread_id } = req.body;

    const result = await toggleLike(req.user!.id, Number(thread_id));

    res.status(200).json({ result });

    io.to("feed").emit("thread:like_updated", {
      threadId: result.threadId,
      likesCount: result.likesCount,
      actorUserId: req.user!.id,
      liked: result.liked,
    });


  } catch (e) {
    res.status(500).json({ message: "Failed to toggle like" });
  }
};