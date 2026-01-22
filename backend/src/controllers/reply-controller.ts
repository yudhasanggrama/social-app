import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { createReply, getRepliesByThreadId } from "../services/reply";


export const create = async (req: AuthRequest, res: Response) => {
  const { thread_id, content } = req.body;
  const reply = await createReply(req.user!.id, thread_id, content);
  return res.status(200).json({ reply });
};


export const findByThreadId = async (req: AuthRequest, res: Response) => {
  try {
    const threadId = Number(req.params.id);

    if (Number.isNaN(threadId)) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Invalid thread id",
      });
    }

    const data = await getRepliesByThreadId(threadId);

    // kalau service kamu return null saat thread ga ada:
    if (!data) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Thread not found",
      });
    }

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Get Replies Successfully",
      data,
    });
  } catch (err) {
    console.error("[findByThreadId] error:", err);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};




