import {authenticateToken, AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";
import { body, query } from 'express-validator';
import {Router} from "express";
import {validateRequest} from "../middleware/validationMiddleware";
import { Unit } from "../db/unit";
import { CalendarService } from "../services/calendarService";
import { ShoppingListService } from "../services/shoppingListService";
import { ErrorResponse } from "../utils/errorResponse";

const router = Router();

router.get('/',
    authenticateToken,
    query('from').optional().isISO8601().withMessage('from must be a valid ISO8601 date'),
    query('to').optional().isISO8601().withMessage('to must be a valid ISO8601 date'),
    query('populate').optional().isBoolean().withMessage('populate must be a boolean'),
    validateRequest,
    async (req: AuthRequest, res) => {
    const unit = new Unit(true);
    try {
        const calendarService = new CalendarService(unit);
        const from = req.query.from as string | undefined;
        const to = req.query.to as string | undefined;
        const populate = req.query.populate === 'true';

        let entries;
        if (from && to) {
            const fromDate = new Date(from);
            const toDate = new Date(to);
            entries = calendarService.getCalendarEntriesByDateRange(req.user!.userId, fromDate, toDate);
        } else {
            entries = calendarService.getCalendarEntries(req.user!.userId);
        }

        if (populate) {
            const userId = req.user ? parseInt(req.user.userId as unknown as string, 10) : undefined;
            const populated = await calendarService.populateWithRecipes(entries, req.ip, userId);
            return res.json(populated);
        }

        res.json(entries);
    } catch (error) {
        return ErrorResponse.internalServerError(res, "Failed to retrieve calendar entries");
    } finally {
        unit.complete();
    }
});

router.get('/shopping-list',
    authenticateToken,
    query('from').isISO8601().withMessage('from is required and must be a valid ISO8601 date'),
    query('to').isISO8601().withMessage('to is required and must be a valid ISO8601 date'),
    query('units').optional().isIn(['us', 'metric', 'both']).withMessage('units must be us, metric, or both'),
    validateRequest,
    async (req: AuthRequest, res) => {
    try {
        const from = new Date(req.query.from as string);
        const to = new Date(req.query.to as string);
        const units = (req.query.units as 'us' | 'metric' | 'both') || 'metric';

        const shoppingListService = new ShoppingListService();
        const shoppingList = await shoppingListService.getShoppingList(req.user!.userId, from, to, units);
        res.json(shoppingList);
    } catch (error) {
        console.error(error);
        return ErrorResponse.internalServerError(res, "Failed to retrieve shopping list");
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
            return ErrorResponse.internalServerError(res, "Failed to add calendar entry");
        }
    });

router.get('/:calendarEntryId', authenticateToken, (req: AuthRequest, res) => {
   const unit = new Unit(true);
   try {
       const calendarService = new CalendarService(unit);
       const id = parseInt(req.params.calendarEntryId as string);
       const entry = calendarService.getCalendarEntryById(id);
       if (!entry) {
           return ErrorResponse.notFound(res, "Calendar entry not found");
       }
       return res.status(StatusCodes.OK).json(entry);
   }
   catch (error) {
       return ErrorResponse.internalServerError(res, "Failed to retrieve calendar entry");
   }
   finally {
       unit.complete();
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
            return res.status(StatusCodes.OK).json({ message: "Calendar entry deleted" });
        } else {
            unit.complete(false);
            return ErrorResponse.notFound(res, "Calendar entry not found");
        }
    } catch (error) {
        unit.complete(false);
        return ErrorResponse.internalServerError(res, "Failed to delete calendar entry");
    }
});

export default router;