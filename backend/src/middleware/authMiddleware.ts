import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/jwtUtils";
import { StatusCodes } from "http-status-codes";

export interface AuthRequest extends Request {
    user?: {
        userId: number;
        email: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Read the JWT from the httpOnly cookie set on login
    const token = req.cookies?.jwt;

    if (!token) {
        return res.sendStatus(StatusCodes.UNAUTHORIZED);
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            return res.sendStatus(StatusCodes.FORBIDDEN);
        }
        req.user = user;
        next();
    });
};
