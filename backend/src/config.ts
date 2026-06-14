import { parseDurationToMilliseconds } from "./utils";

export const CACHE_TTL_MS =
    parseDurationToMilliseconds(process.env.CACHE_TTL_MS, 24 * 60 * 60 * 1000);
export const FRIEND_REQUEST_TTL_MS =
    parseDurationToMilliseconds(process.env.FRIEND_REQUEST_TTL_MS, 60 * 60 * 1000);
export const VERIFICATION_CODE_TTL_MS =
    parseDurationToMilliseconds(process.env.VERIFICATION_CODE_TTL_MS, 60 * 60 * 1000);
