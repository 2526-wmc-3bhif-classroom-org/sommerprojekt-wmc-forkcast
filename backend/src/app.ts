import express from "express";
import cors from "cors";
import { Unit } from "./db/unit";
import authRoutes from "./routes/authRoutes";
import { authenticateToken, AuthRequest } from "./middleware/authMiddleware";

const PORT = 3000;
const app = express();

// Create db if not exists and ensure tables are created
const unit = new Unit(true);
unit.complete();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// Example of a protected route
app.get("/api/users/profile", authenticateToken, (req: AuthRequest, res) => {
    // req.user is available here
    res.json({ message: `Welcome user ${req.user?.userId}` });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
