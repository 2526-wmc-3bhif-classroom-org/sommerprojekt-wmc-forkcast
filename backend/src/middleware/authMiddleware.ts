import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/jwtUtils";
import { ErrorResponse } from "../utils/errorResponse";

export interface AuthRequest extends Request {
    user?: {
        userId: number;
        email: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        return ErrorResponse.unauthorized(res, "Token required");
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            return ErrorResponse.forbidden(res, "Invalid token");
        }
        req.user = user;
        next();
    });
};
