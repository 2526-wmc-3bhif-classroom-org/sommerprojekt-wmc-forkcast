import {authenticateToken, AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";
import { body, param } from 'express-validator';
import {Router} from "express";
import {validateRequest} from "../middleware/validationMiddleware";
import { Unit } from "../db/unit";
import { FavoriteService } from "../services/favoriteService";

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res) => {
    const unit = new Unit(true);
    try {
        const favoriteService = new FavoriteService(unit);
        const userId = parseInt(req.user!.userId as unknown as string, 10);
        const favorites = favoriteService.getFavorites(userId);
        res.status(StatusCodes.OK).json(favorites);
    } catch (error) {
        console.error("Get favorites error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
    } finally {
        unit.complete();
    }
});

router.post('/',
    authenticateToken,
    body('recipeId').notEmpty().withMessage('recipeId is required').isInt().withMessage('recipeId must be an integer').toInt(),
    validateRequest,
    (req: AuthRequest, res) => {
        const unit = new Unit(false);
        try {
            const favoriteService = new FavoriteService(unit);
            const userId = parseInt(req.user!.userId as unknown as string, 10);
            const { recipeId } = req.body;
            
            const newFavorite = favoriteService.addFavorite(userId, recipeId);
            unit.complete(true);
            res.status(StatusCodes.CREATED).json(newFavorite);
        } catch (error: any) {
            unit.complete(false);
            if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: "Recipe not found in local database." });
            } else {
                console.error("Add favorite error:", error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
            }
        }
});

router.delete('/:recipeId', 
    authenticateToken, 
    param('recipeId').isInt().withMessage('recipeId must be an integer').toInt(),
    validateRequest,
    (req: AuthRequest, res) => {
    const unit = new Unit(false);
    try {
        const favoriteService = new FavoriteService(unit);
        const userId = parseInt(req.user!.userId as unknown as string, 10);
        const recipeId = parseInt(req.params.recipeId as string, 10);
        
        const success = favoriteService.removeFavorite(userId, recipeId);
        if (success) {
            unit.complete(true);
            res.status(StatusCodes.OK).json({});
        } else {
            unit.complete(false);
            res.status(StatusCodes.NOT_FOUND).json({});
        }
    } catch (error) {
        unit.complete(false);
        console.error("Remove favorite error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
    }
});

export default router;
