import { Request, Response } from "express";
import { createThread, getThreads } from "../services/thread";
import { AuthRequest } from "../middleware/authMiddleware";


export const create = async (req: AuthRequest, res: Response) => {
  const { content, image } = req.body;

  const thread = await createThread(req.user!.id, content, image);
  return res.status(200).json({ thread });
};

export const findAll = async (_: Request, res: Response) => {
  const threads = await getThreads();
  return res.status(200).json({ threads });
};
