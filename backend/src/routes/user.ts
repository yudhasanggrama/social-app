import express from "express";
import { handleRegister, handleLogin, handleLogout } from "../controllers/auth-controller";

const router  = express.Router();

router.post("/register" ,handleRegister);
router.post("/login", handleLogin);
router.post("/logout", handleLogout)

router.get("/check", (req, res) => {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ message: "Unauthorized" })
    res.status(200).json({ message: "Authorized" })
})

export default router;

