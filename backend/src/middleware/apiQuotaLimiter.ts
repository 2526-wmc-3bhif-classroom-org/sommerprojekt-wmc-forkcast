import { Request, Response, NextFunction } from "express";
import {StatusCodes} from "http-status-codes";

// For production, a persistent store like Redis is recommended.
const ipQuotaUsage = new Map<string, { points: number, expiration: number }>();
const QUOTA_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_QUOTA_POINTS = 10; // 1000 points per window

function getIpUsage(ip: string) {
    const now = Date.now();
    if (!ipQuotaUsage.has(ip) || ipQuotaUsage.get(ip)!.expiration < now) {
        ipQuotaUsage.set(ip, { points: 0, expiration: now + QUOTA_WINDOW_MS });
    }
    return ipQuotaUsage.get(ip)!;
}

export function apiQuotaLimiter(handler: (req: Request, res: Response, next: NextFunction) => void) {
    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip;
        if (!ip) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
            return;
        }
        const usage = getIpUsage(ip);

        if (usage.points >= MAX_QUOTA_POINTS) {
            res.status(StatusCodes.TOO_MANY_REQUESTS).send({ message: "API quota exceeded. Please try again later." });
            return;
        }

        const originalSend = res.send;
        res.send = function (body: any) {
            const pointsUsed = parseInt(res.getHeader('X-API-Quota-Request')?.toString() ?? '0', 10);
            const pointsLeft = parseInt(res.getHeader('X-API-Quota-Left')?.toString() ?? '0', 10);

            if (pointsUsed > 0) {
                const currentUsage = getIpUsage(ip);
                currentUsage.points += pointsUsed;
            }
            
            res.setHeader('X-User-Quota-Used', usage.points);
            res.setHeader('X-User-Quota-Left', MAX_QUOTA_POINTS - usage.points);

            return originalSend.call(this, body);
        };

        handler(req, res, next);
    };
}
