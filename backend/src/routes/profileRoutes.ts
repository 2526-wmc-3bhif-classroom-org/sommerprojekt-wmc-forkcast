import {authenticateToken, AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";
import { body } from 'express-validator';
import {Router} from "express";
import {validateRequest} from "../middleware/validationMiddleware";

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res) => {
    res.sendStatus(StatusCodes.CONFLICT);
});

router.put('/',
    authenticateToken,
    body('name').notEmpty().withMessage('Name is required'),
    body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL'),
    validateRequest,
    (req: AuthRequest, res) => {
        res.sendStatus(StatusCodes.CONFLICT);
    });

export default router;