import express from "express";
import { handleRegister, handleLogin, handleLogout } from "../../controllers/auth-controller";
import { authMiddleware } from "../../middleware/authMiddleware";
import { MyProfile } from "../../services/auth";

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);

router.use(authMiddleware);
router.post("/logout" , handleLogout)
router.get("/me", MyProfile)

export default router;
