import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import * as ReplyController from "../../controllers/reply-controller";
import upload from "../../middleware/upload";

const router = express.Router();

router.use(authMiddleware);

router.post("/replies", upload.array("image", 10) ,ReplyController.create);
router.get("/threads/:id/replies", ReplyController.findByThreadId);
router.post("/reply-likes/toggle", ReplyController.toggleLike);


export default router;
