import "dotenv/config";
import express from "express";
import cors from "cors";
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

const PORT = 3000;
const app = express();
const RECIPE_EXPIRATION_CHECK_INTERVAL : number =
    parseInt(process.env.RECIPE_EXPIRATION_CHECK_INTERVAL || "86400000")
    || 24 * 60 * 60 * 1000; // default to 24 hours

// Create db if not exists and ensure tables are created
const unit = new Unit(true);
unit.complete(null);

const recipeStore = new RemoteRecipeStore();
setInterval(() => {
    console.log("Cleaning up expired recipes...");
    recipeStore.removeExpiredRecipes().catch(console.error);
}, RECIPE_EXPIRATION_CHECK_INTERVAL); // Cleanup

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
