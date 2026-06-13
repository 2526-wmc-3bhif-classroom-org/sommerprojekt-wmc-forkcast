import {ErrorResponse} from "../utils/errorResponse";
import {authenticateToken, AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";
import {body, param, query} from 'express-validator';
import {Router} from "express";
import {validateRequest} from "../middleware/validationMiddleware";
import {Unit} from "../db/unit";
import {FavoriteService} from "../services/favoriteService";

import {RecipeService} from "../services/recipeService";

const router = Router();

router.get('/',
    authenticateToken,
    query('populate').optional().isBoolean(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
    validateRequest,
    async (req: AuthRequest, res) => {
    const unit = new Unit(true);
    try {
        const populate = req.query.populate === 'true';
        const offset = req.query.offset as number | undefined;
        const limit = req.query.limit as number | undefined;
        
        const favoriteService = new FavoriteService(unit);
        const userId = parseInt(req.user!.userId as unknown as string, 10);
        const favorites = favoriteService.getFavorites(userId, offset, limit);
        const result = {
            count: favoriteService.getTotalCount(userId),
            populated: populate,
            foods: favorites,
        }

        if (populate) {
            result.foods = await favoriteService.populateWithRecipes(favorites, req.ip);
        }
        
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        console.error("Get favorites error:", error);
        ErrorResponse.internalServerError(res);
    } finally {
        unit.complete();
    }
});

router.post('/',
    authenticateToken,
    body('recipeId').notEmpty().withMessage('recipeId is required').isInt().withMessage('recipeId must be an integer').toInt(),
    validateRequest,
    async (req: AuthRequest, res) => {
        const userId = parseInt(req.user!.userId as unknown as string, 10);
        const { recipeId } = req.body;

        // Ensure the recipe exists in the local cache to satisfy the foreign key constraint
        const recipeService = new RecipeService();
        const recipe = await recipeService.getRecipeById(recipeId, req.ip);
        if (!recipe) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Recipe not found." });
        }

        const unit = new Unit(false);
        try {
            const favoriteService = new FavoriteService(unit);
            const newFavorite = favoriteService.addFavorite(userId, recipeId);
            unit.complete(true);
            res.status(StatusCodes.CREATED).json(newFavorite);
        } catch (error: any) {
            unit.complete(false);
            console.error("Add favorite error:", error);
            ErrorResponse.internalServerError(res);
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
            ErrorResponse.notFound(res, "Favorite not found");
        }
    } catch (error) {
        unit.complete(false);
        console.error("Remove favorite error:", error);
        ErrorResponse.internalServerError(res);
    }
});

export default router;
