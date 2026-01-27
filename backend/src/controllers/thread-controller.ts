import { Request, Response } from "express";
import { createThread, getThreadsById, getThreadsFormatted } from "../services/thread";
import { AuthRequest } from "../middleware/authMiddleware";
import { io } from "../app";
import { prisma } from "../prisma/client";


export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;

    const files = (req.files as Express.Multer.File[]) ?? [];
    const images: string[] = files.map(
      (f) => `/uploads/${f.filename}`
    );

    const thread = await createThread(req.user!.id, content, images);

    io.to("feed").emit("thread:created", thread);

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


export const findMyThreads = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ code: 401, status: "error", message: "Unauthorized" });
    }

    const threads = await getThreadsFormatted(userId, userId);

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Get My Threads Successfully",
      data: { threads },
    });
  } catch (err) {
    console.error("[findMyThreads] error:", err);
    return res.status(500).json({ code: 500, status: "error", message: "Internal server error" });
  }
};

export async function getThreadsByUserId(req: AuthRequest, res: Response) {
  try {
    const viewerId = req.user!.id;
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ status: "error", message: "Invalid userId" });
    }

    const threads = await prisma.thread.findMany({
      where: { created_by: userId }, 
      orderBy: { created_at: "desc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
          },
        },
        likes: {
          select: { id: true, user_id: true },
        },
      },
    });

    const mapped = threads.map((t) => {
      const likesCount = t.likes.length;
      const isLiked = t.likes.some((l) => l.user_id === viewerId);

      return {
        id: t.id,
        content: t.content,
        image: t.image ?? [],
        created_at: t.created_at,
        updated_at: t.updated_at,

        likes: likesCount,               
        isLiked,                         
        reply: t.number_of_replies ?? 0, 

        user: {
          id: String(t.author.id),
          username: t.author.username,
          name: t.author.full_name,
          avatar: t.author.photo_profile ?? "",
          photo_profile: t.author.photo_profile ?? "", 
        },
      };
    });

    return res.json({ status: "success", data: { threads: mapped } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Failed to fetch threads" });
  }
}


