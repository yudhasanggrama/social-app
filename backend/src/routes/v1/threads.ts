import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import * as ThreadController from "../../controllers/thread-controller"
import upload from "../../middleware/upload";

const router = express.Router();

router.use(authMiddleware);

router.get("/threads", ThreadController.findAll);
router.post("/threads", upload.array("images", 10), ThreadController.create);
router.get("/threads/me", ThreadController.findMyThreads)
router.get("/threads/:id", ThreadController.findThreadById)


export default router;