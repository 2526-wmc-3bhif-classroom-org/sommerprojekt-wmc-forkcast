import {authenticateToken, AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";
import { body } from 'express-validator';
import {Router} from "express";
import {validateRequest} from "../middleware/validationMiddleware";
import { Unit } from "../db/unit";
import { CalendarService } from "../services/calendarService";

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res) => {
    const unit = new Unit(true);
    try {
        const calendarService = new CalendarService(unit);
        const entries = calendarService.getCalendarEntries(req.user!.userId);
        res.json(entries);
    } finally {
        unit.complete();
    }
});

router.post('/',
    authenticateToken,
    body('recipeId').notEmpty().withMessage('recipeId is required'),
    body('date').isISO8601().withMessage('date must be a valid ISO8601 date string'),
    validateRequest,
    (req: AuthRequest, res) => {
        const unit = new Unit(false);
        try {
            const calendarService = new CalendarService(unit);
            const { recipeId, date } = req.body;
            const newEntry = calendarService.addCalendarEntry(req.user!.userId, parseInt(recipeId), new Date(date));
            unit.complete(true);
            res.status(StatusCodes.CREATED).json(newEntry);
        } catch (error) {
            unit.complete(false);
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    });

router.delete('/:calendarEntryId', authenticateToken, (req: AuthRequest, res) => {
    const unit = new Unit(false);
    try {
        const calendarService = new CalendarService(unit);
        const calendarEntryId = parseInt(req.params.calendarEntryId as string);
        const success = calendarService.removeCalendarEntry(req.user!.userId, calendarEntryId);
        if (success) {
            unit.complete(true);
            res.sendStatus(StatusCodes.OK);
        } else {
            unit.complete(false);
            res.sendStatus(StatusCodes.NOT_FOUND);
        }
    } catch (error) {
        unit.complete(false);
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
});

export default router;