import { Request, Response } from "express";
import { createThread, getThreadsFormatted } from "../services/thread";
import { AuthRequest } from "../middleware/authMiddleware";


export const create = async (req: AuthRequest, res: Response) => {
  const { content } = req.body 
  const file = req.file; 

  const image = file ? `/uploads/${file.filename}` : null;


  const thread = await createThread(req.user!.id, content, image);
  return res.status(201).json({ thread });
}

export const findAll = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id; 

  const threads = await getThreadsFormatted(userId);

  return res.status(200).json({
    code: 200,
    status: "success",
    message: "Get Data Thread Successfully",
    data: {
      threads,
    },
  });
};
