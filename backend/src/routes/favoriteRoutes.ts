import {authenticateToken, AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";
import { body, validationResult } from 'express-validator';
import {Router} from "express";
import {validateRequest} from "../middleware/validationMiddleware";

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res) => {
    res.sendStatus(StatusCodes.CONFLICT);
})

router.post('/',
    authenticateToken,
    body('recipeId').notEmpty().withMessage('friendId is required'),
    validateRequest,
    (req: AuthRequest, res) => {
    res.sendStatus(StatusCodes.CONFLICT);
})

router.delete('/:recipeId', (req: AuthRequest, res) => {
    res.sendStatus(StatusCodes.CONFLICT);
})

export default router;