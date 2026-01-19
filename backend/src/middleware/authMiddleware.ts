import jwt from "jsonwebtoken";
import { NextFunction,Request, Response } from "express";

export function authMiddleware( req: Request,res: Response,next: NextFunction) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
}