import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../utils/errorResponse";

// For production, a persistent store like Redis is recommended.
const ipQuotaUsage = new Map<string, { points: number, expiration: number }>();
const QUOTA_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_QUOTA_POINTS = 150; // Example: 150 points per user per day

function getIpUsage(ip: string) {
    const now = Date.now();
    if (!ipQuotaUsage.has(ip) || ipQuotaUsage.get(ip)!.expiration < now) {
        ipQuotaUsage.set(ip, { points: 0, expiration: now + QUOTA_WINDOW_MS });
    }
    return ipQuotaUsage.get(ip)!;
}

/**
 * Updates the quota for a given IP address based on points consumed by an external API call.
 * @param ip The IP address of the user.
 * @param pointsConsumed The number of points consumed by the external API request.
 */
export function updateQuota(ip: string, pointsConsumed: number) {
    const usage = getIpUsage(ip);
    usage.points += pointsConsumed;
}

/**
 * Express middleware to enforce API quota limits per user IP.
 * It checks if the user has exceeded their quota before allowing the request to proceed.
 * It also adds user-specific quota headers to the response.
 * 
 * NOTE: Uses in-memory storage - not persistent across server restarts.
 * For production, use Redis or similar persistent store.
 */
export function apiQuotaLimiter(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    if (!ip) {
        // If IP is not available, we can't apply quota, so we might want to block or log.
        // For now, let's just pass it through, but in a real app, you might want to handle this.
        console.warn("IP address not found for request, skipping quota check.");
        return next();
    }

    const usage = getIpUsage(ip);

    if (usage.points >= MAX_QUOTA_POINTS) {
        const retryAfter = Math.ceil((usage.expiration - Date.now()) / 1000);
        return ErrorResponse.tooManyRequests(
            res,
            "Daily API quota exceeded. Please try again tomorrow.",
            retryAfter
        );
    }

    // Set user-specific quota headers on the response
    res.setHeader('X-User-Quota-Used', usage.points);
    res.setHeader('X-User-Quota-Limit', MAX_QUOTA_POINTS);
    res.setHeader('X-User-Quota-Remaining', MAX_QUOTA_POINTS - usage.points);

    next();
}
