import "dotenv/config";
import express from "express";
import cors from "cors";
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
import notificationRoutes from "./routes/notificationRoutes";
import { RemoteRecipeStore } from "./repository/remoteRecipeStore";
import { parseDurationToMilliseconds } from "./utils";

const PORT = process.env.PORT || "3000";
const app = express();
export const CACHE_TTL_MS =
    parseDurationToMilliseconds(process.env.CACHE_TTL_MS
        ,24 * 60 * 60 * 1000);

console.log(CACHE_TTL_MS)
// Create db if not exists and ensure tables are created
const unit = new Unit(true);
unit.complete(null);

const recipeStore = new RemoteRecipeStore();
setInterval(() => {
    console.log("Cleaning up expired recipes...");
    recipeStore.removeExpiredRecipes().catch(console.error);
}, CACHE_TTL_MS); // Cleanup

// Initial cleanup on startup
recipeStore.removeExpiredRecipes().catch(console.error);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/recipes", authenticateToken, recipeRoutes);
app.use("/api/users/me", authenticateToken, profileRoutes);
app.use("/api/users/me/friends", authenticateToken, friendRoutes);
app.use("/api/users/me/favorites", authenticateToken, favoriteRoutes);
app.use("/api/users/me/calendar", authenticateToken, calendarRoutes);
app.use("/api/users/me/notifications", authenticateToken, notificationRoutes);

const swaggerDocument = YAML.load(path.join(process.cwd(), "src/public/swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
