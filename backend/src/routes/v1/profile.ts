import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { getProfile, updateProfile } from "../../controllers/profile-controller";
import upload from "../../middleware/upload";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.patch("/profile", authMiddleware, upload.single("avatar"),updateProfile)

export default router;
