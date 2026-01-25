import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface UserPayload {
    id:number;
    email:string;
    username:string;
}

export function signToken(payload:UserPayload) {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: "1d"})
}

export function verifyToken(token: string): UserPayload {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
}