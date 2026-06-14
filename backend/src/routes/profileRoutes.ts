import { ErrorResponse } from "../utils/errorResponse";
import {authenticateToken, AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";
import { body } from 'express-validator';
import {Router} from "express";
import { validateRequest } from "../middleware/validationMiddleware";
import { UserRepository } from "../repository/userRepository";
import { Unit } from "../db/unit";
import { comparePassword, hashPassword } from "../utils";

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    const unit = new Unit(false);
    try {
        // userId is stored as a string in the JWT payload, so we parse it to an integer
        const userId = parseInt(req.user!.userId as unknown as string, 10);
        const userRepo = new UserRepository(unit);
        const user = userRepo.findById(userId);
        unit.complete(true);

        if (!user) {
            return ErrorResponse.notFound(res, "User not found");
        }

        // Strip the password before returning the user DTO (same shape as /auth/login)
        const { password: _, ...userDto } = user;
        return res.status(StatusCodes.OK).json(userDto);
    } catch (error) {
        unit.complete(false);
        console.error("Get profile error:", error);
        return ErrorResponse.internalServerError(res);
    }
});

router.patch('/picture',
    authenticateToken,
    body('profilePicture').notEmpty().withMessage('Profile picture is required').isBase64().withMessage('Profile picture has to be base64'),
    validateRequest,
    async (req: AuthRequest, res) => {
        const unit = new Unit(false);
        try {
            const userId = parseInt(req.user!.userId as unknown as string, 10);
            const userRepo = new UserRepository(unit);

            const updatedUser = userRepo.updateProfilePicture(userId, req.body.profilePicture);
            unit.complete(true);
            
            const { password: _, ...userDto } = updatedUser;
            return res.status(StatusCodes.OK).json(userDto);
        }
        catch (error: any) {
            unit.complete(false);
            if (error.message.includes("User not found")) {
                return ErrorResponse.notFound(res, "User not found");
            }
            console.error("Update profile error:", error);
            return ErrorResponse.internalServerError(res);
        }
});

router.patch('/name',
    authenticateToken,
    body('name').notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name must be at most 50 characters'),
    validateRequest,
    async (req: AuthRequest, res) => {
        const unit = new Unit(false);
        try {
            const userId = parseInt(req.user!.userId as unknown as string, 10);
            const userRepo = new UserRepository(unit);

            const existingUser = userRepo.findByName(req.body.name);
            if (existingUser) {
                unit.complete(false);
                return ErrorResponse.conflict(res, "Username already exists");
            }

            const updatedUser = userRepo.updateName(userId, req.body.name);
            unit.complete(true);
            
            const { password: _, ...userDto } = updatedUser;
            return res.status(StatusCodes.OK).json(userDto);
        }
        catch (error: any) {
            unit.complete(false);
            if (error.message.includes("User not found")) {
                return ErrorResponse.notFound(res, "User not found");
            }
            console.error("Update name error:", error);
            return ErrorResponse.internalServerError(res);
        }
});

router.patch('/password',
    authenticateToken,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
        .isStrongPassword().withMessage("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character"),
    validateRequest,
    async (req: AuthRequest, res) => {
        const unit = new Unit(false);
        try {
            const userId = parseInt(req.user!.userId as unknown as string, 10);
            const userRepo = new UserRepository(unit);

            const user = userRepo.findById(userId);
            if (!user) {
                unit.complete(false);
                return ErrorResponse.notFound(res, "User not found");
            }

            const isValidPassword = await comparePassword(req.body.currentPassword, user.password);
            if (!isValidPassword) {
                unit.complete(false);
                return ErrorResponse.badRequest(res, "Current password is incorrect");
            }

            const newPasswordHash = await hashPassword(req.body.newPassword);
            userRepo.updatePassword(userId, newPasswordHash);
            unit.complete(true);
            
            return res.sendStatus(StatusCodes.NO_CONTENT);
        }
        catch (error: any) {
            unit.complete(false);
            console.error("Update password error:", error);
            return ErrorResponse.internalServerError(res);
        }
});

export default router;