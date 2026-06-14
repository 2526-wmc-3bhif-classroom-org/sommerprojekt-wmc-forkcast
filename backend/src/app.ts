import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { Unit } from "./db/unit";
import authRoutes from "./routes/authRoutes";
import { authenticateToken } from "./middleware/authMiddleware";
import friendRoutes from "./routes/friendRoutes";
import recipeRoutes from "./routes/recipeRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import profileRoutes from "./routes/profileRoutes";
import calendarRoutes from "./routes/calendarRoutes";
import { RecipeService } from "./services/recipeService";
import { FriendService } from "./services/friendService";
import { seedFilters } from "./db/seedFilters";
import { parseDurationToMilliseconds } from "./utils";
import rateLimit from "express-rate-limit";
import { apiQuotaLimiter } from "./middleware/apiQuotaLimiter";
import { initializeFilterCache } from "./utils/filterCache";

const PORT = process.env.PORT || "3000";
const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
export const CACHE_TTL_MS =
    parseDurationToMilliseconds(process.env.CACHE_TTL_MS
        ,24 * 60 * 60 * 1000);
export const FRIEND_REQUEST_TTL_MS =
    parseDurationToMilliseconds(process.env.FRIEND_REQUEST_TTL_MS, 60 * 60 * 1000);
export const VERIFICATION_CODE_TTL_MS =
    parseDurationToMilliseconds(process.env.VERIFICATION_CODE_TTL_MS, 60 * 60 * 1000);
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10); // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "200", 10);

const app = express();

// Create db if not exists and ensure tables are created
const unit = new Unit(true);
unit.complete(null);

await seedFilters();
await initializeFilterCache();
await cleanup();

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    handler: (req, res) => {
        res.status(429).json({ message: "Too many requests, please try again later." });
    }
}))

app.use("/api/auth", authRoutes);
app.use("/api/recipes", authenticateToken, apiQuotaLimiter, recipeRoutes);
app.use("/api/users/me", authenticateToken, profileRoutes);
app.use("/api/users/me/friends", authenticateToken, friendRoutes);
app.use("/api/users/me/favorites", authenticateToken, favoriteRoutes);
app.use("/api/users/me/calendar", authenticateToken, calendarRoutes);

const swaggerDocument = YAML.load(path.join(process.cwd(), "src/public/swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

async function cleanup() {
    const recipeService = new RecipeService();
    setInterval(() => {
        console.log("Cleaning up expired recipes...");
        recipeService.removeExpiredRecipes().catch(console.error);
    }, CACHE_TTL_MS); // Cleanup

    // Initial cleanup on startup
    recipeService.removeExpiredRecipes().catch(console.error);

    const sweepRequests = () => {
        try {
            FriendService.removeExpiredRequests();
        } catch (error) {
            console.error("Cleaning up expired friend requests failed:", error);
        }
    };
    setInterval(sweepRequests, FRIEND_REQUEST_TTL_MS);
    sweepRequests();
}
