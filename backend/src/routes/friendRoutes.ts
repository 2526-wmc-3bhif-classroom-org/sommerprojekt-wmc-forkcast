import { Router } from "express";
import { AuthRequest, authenticateToken } from "../middleware/authMiddleware";
import { StatusCodes } from "http-status-codes";
import { body, param } from 'express-validator';
import { validateRequest } from "../middleware/validationMiddleware";
import { Unit } from "../db/unit";
import { FriendService } from "../services/friendService";
import { UserRepository } from "../repository/userRepository";

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res) => {
    const unit = new Unit(true);
    try {
        const friendService = new FriendService(unit);
        const userRepo = new UserRepository(unit);
        const userId = parseInt(req.user!.userId as unknown as string, 10);
        const friends = friendService.getFriends(userId);
        
        const friendProfiles = friends.map(f => {
            const user = userRepo.findById(f.friendId);
            if (user) {
                const { password, email, ...publicProfile } = user;
                return publicProfile;
            }
            return null;
        }).filter(Boolean);

        res.status(StatusCodes.OK).json(friendProfiles);
    } catch (error) {
        console.error("Get friends error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
    } finally {
        unit.complete();
    }
});

router.get('/:friendId',
    authenticateToken,
    param('friendId').isInt().withMessage('friendId must be an integer').toInt(),
    validateRequest,
    (req: AuthRequest, res) => {
        const unit = new Unit(true);
        try {
            const friendService = new FriendService(unit);
            const userRepo = new UserRepository(unit);
            const userId = parseInt(req.user!.userId as unknown as string, 10);
            const friendId = parseInt(req.params.friendId as string, 10);

            // Check if they are actually friends
            const friends = friendService.getFriends(userId);
            if (!friends.find(f => f.friendId === friendId)) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Friend not found in your friend list" });
            }

            const user = userRepo.findById(friendId);
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
            }

            // Strip the password and email before returning the user profile
            const { password: _, email: __, ...userDto } = user;
            res.status(StatusCodes.OK).json(userDto);
        } catch (error) {
            console.error("Get friend profile error:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
        } finally {
            unit.complete();
        }
    });

router.post(
    '/',
    authenticateToken,
    body('friendId').notEmpty().withMessage('friendId is required').isInt().withMessage('friendId must be an integer').toInt(),
    validateRequest,
    (req: AuthRequest, res) => {
        const unit = new Unit(false);
        try {
            const friendService = new FriendService(unit);
            const userId = parseInt(req.user!.userId as unknown as string, 10);
            const { friendId } = req.body;

            const newFriend = friendService.addFriend(userId, friendId);
            unit.complete(true);
            res.status(StatusCodes.CREATED).json(newFriend);
        } catch (error: any) {
            unit.complete(false);
            if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: "User to add as friend not found." });
            } else if (error.message === "Cannot add yourself as a friend") {
                res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
            } else {
                console.error("Add friend error:", error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
            }
        }
    }
);

router.delete('/:friendId', 
    authenticateToken,
    param('friendId').isInt().withMessage('friendId must be an integer').toInt(),
    validateRequest,
    (req: AuthRequest, res) => {
    const unit = new Unit(false);
    try {
        const friendService = new FriendService(unit);
        const userId = parseInt(req.user!.userId as unknown as string, 10);
        const friendId = parseInt(req.params.friendId as string, 10);

        const success = friendService.removeFriend(userId, friendId);
        if (success) {
            unit.complete(true);
            res.status(StatusCodes.OK).json({});
        } else {
            unit.complete(false);
            res.status(StatusCodes.NOT_FOUND).json({});
        }
    } catch (error) {
        unit.complete(false);
        console.error("Remove friend error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
    }
});

export default router;
