import {authenticateToken, AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";
import { body, validationResult } from 'express-validator';
import {Router} from "express";

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res) => {
    res.sendStatus(StatusCodes.CONFLICT);
})

router.post('/',
    authenticateToken,
    body('recipeId').notEmpty().withMessage('friendId is required'),
    (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }

    res.sendStatus(StatusCodes.CONFLICT);
})

router.delete('/:recipeId', (req: AuthRequest, res) => {
    res.sendStatus(StatusCodes.CONFLICT);
})

export default router;