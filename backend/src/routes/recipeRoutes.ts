import { Router, Response } from "express";
import {StatusCodes} from "http-status-codes";
import { query, param } from "express-validator";
import { RecipeService } from "../services/recipeService";
import { validateRequest } from "../middleware/validationMiddleware";
import {AuthRequest} from "../middleware/authMiddleware";
import { FilterRepository } from "../repository/filterRepository";
import { FilterValidator } from "../utils/filterValidator";
import { ErrorResponse } from "../utils/errorResponse";

const router = Router();
const recipeService = new RecipeService();
const filterRepository = new FilterRepository();
const filterValidator = new FilterValidator();

router.get("/filters",
    async (req: AuthRequest, res: Response) => {
    try {
        const filters = filterRepository.getFiltersStructured();
        res.json(filters);
    } catch (e) {
        console.error(e);
        return ErrorResponse.internalServerError(res, "Failed to retrieve filters");
    }
});

router.get("/",
    query("search").optional().isString().trim().escape(),
    query("number").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("offset").optional().isInt({ min: 0 }).toInt(),
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

        const filters = filterValidator.validateAndBuild(req.query as Record<string, any>);
        const number = (typeof req.query.number === 'string' ? parseInt(req.query.number) : undefined) ?? 10;
        const offset = (typeof req.query.offset === 'string' ? parseInt(req.query.offset) : undefined) ?? 0;
        const userId = req.user ? parseInt(req.user.userId as unknown as string, 10) : undefined;
        
        const recipes = await recipeService.searchRecipes(search, req.ip, { ...filters, offset }, number, userId);
        res.json(recipes);
    } catch (e) {
        console.error(e);
        return ErrorResponse.internalServerError(res, "Failed to search recipes");
    }
});

router.get("/:id",
    param("id").isInt().withMessage("Recipe ID must be an integer").toInt(),
    validateRequest,
    async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user ? parseInt(req.user.userId as unknown as string, 10) : undefined;
        const recipe = await recipeService.getRecipeById(Number(id), req.ip, userId);
        if (!recipe) {
            return ErrorResponse.notFound(res, "Recipe not found");
        }
        res.json(recipe);
    } catch (e) {
        console.error(e);
        return ErrorResponse.internalServerError(res, "Failed to retrieve recipe");
    }
});

export default router;