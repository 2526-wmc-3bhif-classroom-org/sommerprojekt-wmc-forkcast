import express from "express";
import {AccountService} from "../service/accountService";

export const accountRouter = express.Router();
const accountService = new AccountService();

accountRouter.post("/login", async (req, res) => {
    const { username, email, password} = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: "Username, password and email are required" });
    }

    try {
        await accountService.createAccount(username, email, password);
        res.status(201).json({ message: "Account created successfully" });
    } catch (error : any) {
        res.status(400).json({ error: error.message });
    }
});