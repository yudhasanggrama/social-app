import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import * as ThreadController from "../../controllers/thread-controller"
import upload from "../../middleware/upload";

const router = express.Router();

router.use(authMiddleware);

router.get("/threads", ThreadController.findAll);
router.post("/threads", upload.single("image"), ThreadController.create);

export default router;