import type { Request, Response } from "express";
import { searchUsersService } from "../services/search";

export async function searchUsers(req: Request, res: Response) {
  try {
    const keywordRaw = String(req.query.keyword ?? "").trim();
    let keyword = keywordRaw.slice(0, 64);

    if (keyword.startsWith("@")) {
    keyword = keyword.slice(1);
    }

    const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 20);

    const meId = (req as any).user?.id
      ? Number((req as any).user.id)
      : null;

    const users = await searchUsersService({
      keyword,
      limit,
      meId,
    });

    return res.json({
      status: "success",
      data: { users },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch user data. Please try again later.",
    });
  }
}
