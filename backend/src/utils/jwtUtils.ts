import { Response } from "express";
import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
export const JWT_EXPIRY = process.env.JWT_EXPIRY || "30m";

const parseExpiryStringToMilliseconds = (expiry: string): number => {
    const value = parseInt(expiry.slice(0, -1));
    const unit = expiry.slice(-1);

    if (isNaN(value)) {
        throw new Error("Invalid JWT_EXPIRY value: " + expiry);
    }

    switch (unit) {
        case "s":
            return value * 1000;
        case "m":
            return value * 60 * 1000;
        case "h":
            return value * 60 * 60 * 1000;
        case "d":
            return value * 24 * 60 * 60 * 1000;
        default:
            if (!isNaN(parseInt(expiry))) {
                return parseInt(expiry) * 1000;
            }
            throw new Error("Invalid JWT_EXPIRY unit: " + expiry);
    }
};

const generateJWT = (res: Response, userId: string) => {
    // @ts-ignore
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    let maxAgeMilliseconds: number;
    try {
        maxAgeMilliseconds = parseExpiryStringToMilliseconds(JWT_EXPIRY);
    } catch (error) {
        console.error("Error parsing JWT_EXPIRY:", error);
        throw error;
    }

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