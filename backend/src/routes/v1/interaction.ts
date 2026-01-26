import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import * as LikeController from "../../controllers/like-controller";
import * as FollowingController from "../../controllers/following-controller";

const router = express.Router();

router.use(authMiddleware);

router.post("/likes/toggle", LikeController.toggle);
// router.post("/follow/toggle", FollowingController.toggle);

export default router;