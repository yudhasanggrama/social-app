// src/controllers/user-profile-controller.ts
import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import { getUserProfileByUsernameService } from "../services/profile";

export async function getUserProfile(req: AuthRequest, res: Response) {
    try {
        const viewerId = req.user!.id;
        const username = String(req.params.username ?? "").trim();

        if (!username) {
        return res.status(400).json({ status: "error", message: "username is required" });
        }

        const result = await getUserProfileByUsernameService({ viewerId, username });

        if (!result.success && result.reason === "USER_NOT_FOUND") {
        return res.status(404).json({ status: "error", message: "User not found" });
        }

        return res.json({ status: "success", data: result.data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Failed to fetch user profile" });
    }
}
