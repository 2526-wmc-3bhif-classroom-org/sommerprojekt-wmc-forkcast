import {authenticateToken, AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";
import { body } from 'express-validator';
import {Router} from "express";
import {validateRequest} from "../middleware/validationMiddleware";

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res) => {
    res.sendStatus(StatusCodes.CONFLICT);
});

router.post('/',
    authenticateToken,
    body('recipeId').notEmpty().withMessage('recipeId is required'),
    body('date').isISO8601().withMessage('date must be a valid ISO8601 date string'),
    validateRequest,
    (req: AuthRequest, res) => {
        res.sendStatus(StatusCodes.CONFLICT);
    });

router.delete('/:calendarEntryId', authenticateToken, (req: AuthRequest, res) => {
    res.sendStatus(StatusCodes.CONFLICT);
});

export default router;