import express from "express";
import { UserService } from "../service/userService";

export const userRouter = express.Router();
const userService = new UserService();

userRouter.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email and password are required" });
    }

    try {
        await userService.createAccount(username, email, password);
        res.status(201).json({ message: "Account created successfully" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

userRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        const success = await userService.loginAccount(username, password);
        if (success) {
            res.json({ message: "Login successful" });
        } else {
            res.status(401).json({ error: "Invalid username or password" });
        }
    } catch {
        res.status(500).json({ error: "An error occurred during login" });
    }
});
