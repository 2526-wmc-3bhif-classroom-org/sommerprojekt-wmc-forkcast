import {authenticateToken, AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";
import { body } from 'express-validator';
import {Router} from "express";
import {validateRequest} from "../middleware/validationMiddleware";
import { UserRepository } from "../repository/userRepository";
import { Unit } from "../db/unit";

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
            return res.sendStatus(StatusCodes.NOT_FOUND);
        }

        // Strip the password before returning the user DTO (same shape as /auth/login)
        const { password: _, ...userDto } = user;
        return res.status(StatusCodes.OK).json(userDto);
    } catch (error) {
        unit.complete(false);
        console.error("Get profile error:", error);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
});

router.put('/',
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
                return res.sendStatus(StatusCodes.NOT_FOUND);
            }
            console.error("Update profile error:", error);
            return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
});

export default router;