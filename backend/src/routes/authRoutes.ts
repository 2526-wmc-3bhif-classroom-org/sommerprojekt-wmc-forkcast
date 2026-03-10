import { Router, Request, Response, NextFunction } from "express";
import { AuthService } from "../service/authService";
import { Unit } from "../db/unit";
import {StatusCodes} from "http-status-codes";
import {body} from "express-validator";
import {validateRequest} from "../middleware/validationMiddleware";

const router = Router();

router.post("/register",
    body("name").notEmpty().withMessage("Username is required"),
    body("email").notEmpty().isEmail().withMessage("Email is required and must be a valid email"),
    body("password").notEmpty().withMessage("Password is required").isStrongPassword,
    validateRequest,
    async (req: Request, res: Response) => {
    const unit = new Unit(false);
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.sendStatus(StatusCodes.BAD_REQUEST).json({ message: "Name, email, and password are required" });
        }

        const authService = new AuthService(unit);
        const user = await authService.register(name, email, password);
        unit.complete(true);
        res.sendStatus(StatusCodes.CREATED).json(user);
    } catch (error: any) {
        unit.complete(false);
        if (error.message.includes("email already exists")) {
            return res.sendStatus(StatusCodes.CONFLICT).json({ message: error.message });
        }
    }
});

router.post("/login",
    body("email").notEmpty().isEmail().withMessage("Email is required and must be a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest,
    async (req: Request, res: Response) => {
    const unit = new Unit(false);
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.sendStatus(StatusCodes.BAD_REQUEST).json({ message: "Email and password are required" });
        }

        const authService = new AuthService(unit);
        const user = await authService.login(res, email, password); // Pass res and expect user object
        unit.complete(true);
        return res.sendStatus(StatusCodes.OK).json(user); // Return user object, token is set as cookie
    } catch (error: any) {
        unit.complete(false);
        if (error.message.includes("Invalid credentials")) {
            return res.sendStatus(StatusCodes.UNAUTHORIZED).json({ message: error.message });
        }
    }
});

export default router;
