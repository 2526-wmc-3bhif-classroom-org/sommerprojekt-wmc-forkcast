import { Router, Request, Response } from "express";
import { AuthService } from "../service/authService";
import { Unit } from "../db/unit";
import {StatusCodes} from "http-status-codes";
import {body} from "express-validator";
import {validateRequest} from "../middleware/validationMiddleware";
import {verifyCode} from "../services/emailValidationService";
import {authenticateToken, AuthRequest} from "../middleware/authMiddleware";

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
        if (error.message.includes("email already exists") || error.message.includes("username already exists")) {
            res.status(StatusCodes.CONFLICT).json({ message: error.message });
        } else {
            console.error("Register error:", error);
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
});

router.post("/login",
    body("identifier").notEmpty().withMessage("Email or Username is required"),
    body("email").optional().isEmail().withMessage("If provided, email must be a valid email"),
    body("username").optional().isString().withMessage("If provided, username must be a string"),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest,
    async (req: Request, res: Response) => {
    const unit = new Unit(false);
    try {
        const { identifier, password } = req.body;

        const authService = new AuthService(unit);
        const { user, token } = await authService.login(identifier, password);
        unit.complete(true);
        return res.status(StatusCodes.OK).json({
            user: user,
            token: token
        });
    } catch (error: any) {
        unit.complete(false);
        if (error.message.includes("Invalid credentials")) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
        } else if (error.message.includes("Account not verified")) {
            res.status(StatusCodes.FORBIDDEN).json({ message: error.message });
        }
        else {
            console.error("Login error:", error);
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
});

router.post("/verify",
    body("email").notEmpty().isEmail().withMessage("Email is required and must be a valid email"),
    body("code").notEmpty().isNumeric().isLength({ min: 6, max: 6 }).withMessage("Code is required and must a 6-digit number"),
    validateRequest,
    async (req: Request, res: Response) => {
    const unit = new Unit(false);
    try {
        const { email, code } = req.body;

        if (!verifyCode(email, code)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid code" });
        }

        const authService = new AuthService(unit);
        await authService.verifyUser(email);
        unit.complete(true);

        res.status(StatusCodes.OK).json({ message: "Code verified successfully" });
    }
    catch (error: any) {
        unit.complete(false);
        console.error("Verify error:", error);
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
});

router.post("/password/reset",
    body('password').notEmpty().withMessage("New password is required").isStrongPassword().withMessage("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character"),
    validateRequest,
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
    const unit = new Unit(false);
    try {
        const { password } = req.body;
        // TODO: make a middleware for this
        // userId is stored as a string in the JWT payload, so we parse it to an integer
        const userId = parseInt(req.user!.userId as unknown as string, 10);
        
        const authService = new AuthService(unit);
        await authService.resetPassword(userId, password);
        unit.complete(true);

        return res.status(StatusCodes.OK).json({ message: "Password reset successfully" });
    } catch (error: any) {
        unit.complete(false);
        if (error.message.includes("User not found")) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
        }
        console.error("Password reset error:", error);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
});

export default router;
