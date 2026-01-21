import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import * as ReplyController from "../../controllers/reply-controller";

const router = express.Router();

router.use(authMiddleware);

router.post("/replies", ReplyController.create);

export default router;
