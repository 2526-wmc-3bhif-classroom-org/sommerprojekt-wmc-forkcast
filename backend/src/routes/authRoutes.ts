import { Router, Request, Response, NextFunction } from "express";
import { AuthService } from "../service/authService";
import { Unit } from "../db/unit";
import {StatusCodes} from "http-status-codes";
import {body} from "express-validator";
import {validateRequest} from "../middleware/validationMiddleware";
import {authenticateToken} from "../middleware/authMiddleware";
import {clearJWT} from "../utils/jwtUtils";

const router = Router();

router.post("/register",
    body("name").notEmpty().withMessage("Username is required"),
    body("email").notEmpty().isEmail().withMessage("Email is required and must be a valid email"),
    body("password").notEmpty().withMessage("Password is required").isStrongPassword().withMessage("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character"),
    validateRequest,
    async (req: Request, res: Response) => {
    const unit = new Unit(false);
    try {
        const { name, email, password } = req.body;

        const authService = new AuthService(unit);
        const user = await authService.register(name, email, password);
        unit.complete(true);
        res.status(StatusCodes.CREATED).json(user);
    } catch (error: any) {
        unit.complete(false);
        if (error.message.includes("email already exists")) {
            res.status(StatusCodes.CONFLICT).json({ message: error.message });
        } else {
            console.error("Register error:", error);
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
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

        const authService = new AuthService(unit);
        const user = await authService.login(res, email, password); // Pass res and expect user object
        unit.complete(true);
        return res.status(StatusCodes.OK).json(user); // Return user object, token is set as cookie
    } catch (error: any) {
        unit.complete(false);
        if (error.message.includes("Invalid credentials")) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
        } else {
            console.error("Login error:", error);
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
});

router.post('/logout', authenticateToken, (req: Request, res: Response) => {
    clearJWT(res);
    res.sendStatus(StatusCodes.OK);
});

export default router;
