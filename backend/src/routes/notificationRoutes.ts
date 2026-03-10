import {authenticateToken, AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";
import { body } from 'express-validator';
import {Router} from "express";
import {validateRequest} from "../middleware/validationMiddleware";

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res) => {
    res.sendStatus(StatusCodes.CONFLICT);
});

router.put('/:notificationId',
    authenticateToken,
    body('isRead').isBoolean().withMessage('isRead must be a boolean'),
    validateRequest,
    (req: AuthRequest, res) => {
        res.sendStatus(StatusCodes.CONFLICT);
    });

export default router;