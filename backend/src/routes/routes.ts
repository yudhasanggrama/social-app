import express from "express";
import { handleRegister, handleLogin, handleLogout } from "../controllers/auth-controller";
import { authMiddleware } from "../middleware/authMiddleware";
import * as ThreadController from "../controllers/thread-controller";
import * as ReplyController from "../controllers/reply-controller";
import * as LikeController from "../controllers/like-controller";
import * as FollowingController from "../controllers/following-controller";


const router  = express.Router();

router.post("/register" ,handleRegister);
router.post("/login", handleLogin);
router.post("/logout", handleLogout)
router.get("/me", authMiddleware, (req: any, res) => {
  res.json({
    user: req.user, // ⬅️ HARUS ADA
  })
})

router.get("/threads", ThreadController.findAll);
// router.get("/threads/:id", ThreadController.findOne);

router.post("/threads", authMiddleware, ThreadController.create);
// router.put("/threads/:id", authMiddleware, ThreadController.update);
// router.delete("/threads/:id", authMiddleware, ThreadController.remove);

router.post("/replies", authMiddleware, ReplyController.create);
// router.get("/threads/:threadId/replies", ReplyController.findByThread);
router.post("/likes/toggle", authMiddleware, LikeController.toggle);

router.post("/follow/toggle", authMiddleware, FollowingController.toggle);
// router.get("/followers/:userId", FollowingController.getFollowers);
// router.get("/following/:userId", FollowingController.getFollowing);



export default router;