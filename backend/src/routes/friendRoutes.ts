import {Router} from "express";
import {AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";
import { body, validationResult } from 'express-validator';

const router = Router();

router.get('/', (req: AuthRequest, res) => {
    res.sendStatus(StatusCodes.CONFLICT);
});

router.post(
    '/',
    body('friendId').notEmpty().withMessage('friendId is required'),
    (req: AuthRequest, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        res.sendStatus(StatusCodes.CONFLICT);
    }
);

router.delete('/:friendId', (req: AuthRequest, res) => {
    res.sendStatus(StatusCodes.CONFLICT);
})

export default router;