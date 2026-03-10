import { Response } from "express";
import jwt from "jsonwebtoken";import { parseDurationToMilliseconds } from "../utils";

export const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
export const JWT_EXPIRY = process.env.JWT_EXPIRY || "30m";

const generateJWT = (res: Response, userId: string) => {
    // @ts-ignore
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    // Use shared utility to parse duration, defaulting to 30 minutes if parsing fails
    const maxAgeMilliseconds = parseDurationToMilliseconds(JWT_EXPIRY, 30 * 60 * 1000);

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: maxAgeMilliseconds,
        path: "/",
    });
};

const clearJWT = (res: Response) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0),
        path: "/",
    });
};

export { generateJWT, clearJWT };