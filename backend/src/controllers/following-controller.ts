import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { toggleFollow } from "../services/following";

export const toggle = async (req: AuthRequest, res: Response) => {
  const { following_id } = req.body;
  const result = await toggleFollow(req.user!.id, following_id);
  return res.status(200).json({ result });
};
