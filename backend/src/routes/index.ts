import express from "express";
import authRoutes from "./v1/auth";
import threadsRoutes from "./v1/threads";
import repliesRoutes from "./v1/replies";
import interactionsRoutes from "./v1/interaction";
import profileRoutes from "./v1/profile";
import followRoutes from "./v1/follows"


const router = express.Router();

router.use(authRoutes);
router.use(threadsRoutes);
router.use(repliesRoutes);
router.use(interactionsRoutes);
router.use(profileRoutes);
router.use(followRoutes);


export default router;
