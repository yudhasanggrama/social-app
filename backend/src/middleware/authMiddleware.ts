import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

export function authMiddleware(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    req.user = decoded   // ⬅️ INI KUNCI UTAMA
    next()
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }
}


export interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}
