import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { createReply } from "../services/reply";

export const create = async (req: AuthRequest, res: Response) => {
  const { thread_id, content } = req.body;

  const reply = await createReply(req.user!.id, thread_id, content);
  return res.status(200).json({ reply });
}
