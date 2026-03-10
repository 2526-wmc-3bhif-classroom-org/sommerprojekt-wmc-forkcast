import "dotenv/config";
import express from "express";
import cors from "cors";
import { Unit } from "./db/unit";
import authRoutes from "./routes/authRoutes";
import { authenticateToken, AuthRequest } from "./middleware/authMiddleware";
import friendRoutes from "./routes/friendRoutes";

const PORT = 3000;
const app = express();

// Create db if not exists and ensure tables are created
const unit = new Unit(true);
unit.complete(null);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users/me/friends", authenticateToken, friendRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
