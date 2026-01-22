import { Request, Response } from "express";
import { createThread, getThreadsById, getThreadsFormatted } from "../services/thread";
import { AuthRequest } from "../middleware/authMiddleware";
import { io } from "../app";


export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;

    const files = (req.files as Express.Multer.File[]) ?? [];
    const images: string[] = files.map(
      (f) => `/uploads/${f.filename}`
    );

    const thread = await createThread(req.user!.id, content, images);

    io.emit("thread:created", thread);

    return res.status(201).json({ success: true, thread });
  } catch (err) {
    console.error("[create thread] error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create thread" });
  }
};



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

export const findThreadById = async (req: AuthRequest, res: Response) => {
  try {
    const threadId = Number(req.params.id);
    const userId = req.user?.id;

    if (Number.isNaN(threadId)) {
      return res.status(400).json({ code: 400, status: "error", message: "Invalid thread id" });
    }

    const data = await getThreadsById(threadId, userId);

    if (!data) {
      return res.status(404).json({ code: 404, status: "error", message: "Thread not found" });
    }

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Get Data Thread Successfully",
      data,
    });
  } catch (err) {
    return res.status(500).json({ code: 500, status: "error", message: "Internal server error" });
  }
};


