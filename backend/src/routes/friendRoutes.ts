import { ErrorResponse } from "../utils/errorResponse";
import { Router } from "express";
import { AuthRequest, authenticateToken } from "../middleware/authMiddleware";
import { StatusCodes } from "http-status-codes";
import { body, param, query } from 'express-validator';
import { validateRequest } from "../middleware/validationMiddleware";
import { Unit } from "../db/unit";
import { FriendService, FriendServiceError, FriendServiceErrorCode } from "../services/friendService";
import { FavoriteService } from "../services/favoriteService";
import { UserRepository } from "../repository/userRepository";

const router = Router();

const ERROR_STATUS: Record<FriendServiceErrorCode, number> = {
    NOT_FOUND: StatusCodes.NOT_FOUND,
    SELF: StatusCodes.BAD_REQUEST,
    ALREADY_FRIENDS: StatusCodes.CONFLICT,
    DUPLICATE: StatusCodes.CONFLICT,
    FORBIDDEN: StatusCodes.FORBIDDEN,
};

function handleServiceError(res: any, error: unknown, context: string): void {
    if (error instanceof FriendServiceError) {
        res.status(ERROR_STATUS[error.code]).json({ message: error.message });
        return;
    }
    console.error(`${context}:`, error);
    ErrorResponse.internalServerError(res);
}

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
        ErrorResponse.internalServerError(res);
    } finally {
        unit.complete();
    }
});

router.get('/requests', authenticateToken, (req: AuthRequest, res) => {
    const unit = new Unit(true);
    try {
        const friendService = new FriendService(unit);
        const userId = parseInt(req.user!.userId as unknown as string, 10);
        res.status(StatusCodes.OK).json(friendService.getIncomingRequests(userId));
    } catch (error) {
        console.error("Get friend requests error:", error);
        ErrorResponse.internalServerError(res);
    } finally {
        unit.complete();
    }
});

router.post('/requests',
    authenticateToken,
    body('username').trim().notEmpty().withMessage('username is required').isString().withMessage('username must be a string'),
    validateRequest,
    (req: AuthRequest, res) => {
        const unit = new Unit(false);
        try {
            const friendService = new FriendService(unit);
            const userId = parseInt(req.user!.userId as unknown as string, 10);
            const result = friendService.sendRequest(userId, req.body.username);
            unit.complete(true);
            const status = result.status === 'accepted' ? StatusCodes.OK : StatusCodes.CREATED;
            res.status(status).json(result);
        } catch (error) {
            unit.complete(false);
            handleServiceError(res, error, "Send friend request error");
        }
    });

router.post('/requests/:id/accept',
    authenticateToken,
    param('id').isInt().withMessage('id must be an integer').toInt(),
    validateRequest,
    (req: AuthRequest, res) => {
        const unit = new Unit(false);
        try {
            const friendService = new FriendService(unit);
            const userId = parseInt(req.user!.userId as unknown as string, 10);
            const requestId = parseInt(req.params.id as string, 10);
            const friend = friendService.acceptRequest(userId, requestId);
            unit.complete(true);
            res.status(StatusCodes.OK).json(friend);
        } catch (error) {
            unit.complete(false);
            handleServiceError(res, error, "Accept friend request error");
        }
    });

router.post('/requests/:id/decline',
    authenticateToken,
    param('id').isInt().withMessage('id must be an integer').toInt(),
    validateRequest,
    (req: AuthRequest, res) => {
        const unit = new Unit(false);
        try {
            const friendService = new FriendService(unit);
            const userId = parseInt(req.user!.userId as unknown as string, 10);
            const requestId = parseInt(req.params.id as string, 10);
            friendService.declineRequest(userId, requestId);
            unit.complete(true);
            res.status(StatusCodes.OK).json({});
        } catch (error) {
            unit.complete(false);
            handleServiceError(res, error, "Decline friend request error");
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
            ErrorResponse.internalServerError(res);
        } finally {
            unit.complete();
        }
    });

router.get('/:friendId/friends',
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

            if (!friendService.getFriends(userId).some(f => f.friendId === friendId)) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Friend not found in your friend list" });
            }

            const profiles = friendService.getFriends(friendId).map(f => {
                const user = userRepo.findById(f.friendId);
                if (!user) return null;
                const { password, email, ...publicProfile } = user;
                return publicProfile;
            }).filter(Boolean);

            res.status(StatusCodes.OK).json(profiles);
        } catch (error) {
            console.error("Get friend's friends error:", error);
            ErrorResponse.internalServerError(res);
        } finally {
            unit.complete();
        }
    });

router.get('/:friendId/favorites',
    authenticateToken,
    param('friendId').isInt().withMessage('friendId must be an integer').toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
    validateRequest,
    async (req: AuthRequest, res) => {
        const unit = new Unit(true);
        try {
            const friendService = new FriendService(unit);
            const favoriteService = new FavoriteService(unit);
            const userId = parseInt(req.user!.userId as unknown as string, 10);
            const friendId = parseInt(req.params.friendId as string, 10);

            if (!friendService.getFriends(userId).some(f => f.friendId === friendId)) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Friend not found in your friend list" });
            }

            const limit = req.query.limit as number | undefined;
            const favorites = favoriteService.getFavorites(friendId, 0, limit);
            // Annotate isFavorited against the requesting user (not the friend) so
            // the client knows which of the friend's favorites it already has.
            const foods = await favoriteService.populateWithRecipes(favorites, userId, req.ip);

            res.status(StatusCodes.OK).json({
                count: favoriteService.getTotalCount(friendId),
                populated: true,
                foods,
            });
        } catch (error) {
            console.error("Get friend's favorites error:", error);
            ErrorResponse.internalServerError(res);
        } finally {
            unit.complete();
        }
    });

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
            ErrorResponse.notFound(res, "Friend not found");
        }
    } catch (error) {
        unit.complete(false);
        console.error("Remove friend error:", error);
        ErrorResponse.internalServerError(res);
    }
});

export default router;
