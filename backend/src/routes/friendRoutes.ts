import {Router} from "express";
import {AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";
import { body } from 'express-validator';
import { validateRequest } from "../middleware/validationMiddleware";

const router = Router();

router.get('/', (req: AuthRequest, res) => {
    res.sendStatus(StatusCodes.CONFLICT);
});

router.post(
    '/',
    body('friendId').notEmpty().withMessage('friendId is required'),
    validateRequest,
    (req: AuthRequest, res) => {
        res.sendStatus(StatusCodes.CONFLICT);
    }
);

router.delete('/:friendId', (req: AuthRequest, res) => {
    res.sendStatus(StatusCodes.CONFLICT);
})

export default router;