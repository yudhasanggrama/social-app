import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { toggleLike } from "../services/like";

export const toggle = async (req: AuthRequest, res: Response) => {
  const { thread_id } = req.body;
  const result = await toggleLike(req.user!.id, thread_id);
  return res.status(200).json({ result });
};
