import { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import { getProfileByUserId, updateMyProfile } from "../services/profile";

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id; // asumsi middleware auth inject ke req.user

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "UNAUTHORIZED",
      });
    }

    const profile = await getProfileByUserId(userId);

    return res.status(200).json({
      success: true,
      message: "GET PROFILE SUCCESS",
      data: profile,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err?.message ?? "GET PROFILE FAILED",
    });
  }
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Unauthorized",
      });
    }

    const { name, username, bio } = req.body;
    const file = req.file as Express.Multer.File | undefined;

    const photo_profile = file ? `uploads/${file.filename}` : undefined;
    
    const data = await updateMyProfile(userId, {
      full_name: name,
      username,
      bio: bio ?? null,
      photo_profile,
    });

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Profile updated successfully",
      data,
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Username already taken",
      });
    }

    if (err?.message === "USERNAME TOO SHORT") {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Username minimal 3 karakter",
      });
    }

    if (err?.message === "NAME TOO SHORT") {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Nama minimal 2 karakter",
      });
    }

    console.error("[updateProfile] error:", err);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};
