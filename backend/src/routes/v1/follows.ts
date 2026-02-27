import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import * as FollowingController from "../../controllers/following-controller";

const router = express.Router();

router.use(authMiddleware);

router.get("/follows", FollowingController.getFollows);
router.post("/follows", FollowingController.followUser);
router.delete("/follows", FollowingController.unfollowUser);
router.get("/follows/suggested", FollowingController.getSuggested);
router.get("/follows/user/:userId", FollowingController.getFollowsByUserId);


export default router;
