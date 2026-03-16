import { Router, Response } from "express";
import {StatusCodes} from "http-status-codes";
import { query, param } from "express-validator";
import { RecipeService } from "../services/recipeService";
import { validateRequest } from "../middleware/validationMiddleware";
import {AuthRequest} from "../middleware/authMiddleware";

const router = Router();
const recipeService = new RecipeService();

router.get("/",
    query("search").optional().isString().trim().escape(),
    validateRequest,
    async (req: AuthRequest, res: Response) => {
    try {
        const search = req.query.search as string;

        // do not use the API if search is empty, return empty array instead
        // to reduce unnecessary API calls and improve performance
        if(!search) {
            res.json([]);
            return;
        }

        const recipes = await recipeService.searchRecipes(search, req.ip);
        res.json(recipes);
    } catch (e) {
        console.error(e);
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
});

router.get("/:id",
    param("id").isInt().withMessage("Recipe ID must be an integer").toInt(),
    validateRequest,
    async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const recipe = await recipeService.getRecipeById(Number(id), req.ip);
        if (!recipe) {
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        res.json(recipe);
    } catch (e) {
        console.error(e);
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
});

export default router;