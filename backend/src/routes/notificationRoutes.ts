import {authenticateToken, AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";
import { body } from 'express-validator';
import {Router} from "express";
import {validateRequest} from "../middleware/validationMiddleware";
import { ErrorResponse } from "../utils/errorResponse";

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res) => {
    return ErrorResponse.send(res, StatusCodes.NOT_IMPLEMENTED, "Notifications endpoint not yet implemented");
});

router.put('/:notificationId',
    authenticateToken,
    body('isRead').isBoolean().withMessage('isRead must be a boolean'),
    validateRequest,
    (req: AuthRequest, res) => {
        return ErrorResponse.send(res, StatusCodes.NOT_IMPLEMENTED, "Notifications endpoint not yet implemented");
    });

export default router;