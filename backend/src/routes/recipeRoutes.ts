import { Router, Request, Response } from "express";
import {AuthRequest} from "../middleware/authMiddleware";
import {StatusCodes} from "http-status-codes";

const router = Router();

router.get("/", async (req: AuthRequest, res: Response) => {
    res.sendStatus(StatusCodes.CONFLICT);
});

router.get("/:id", async (req: AuthRequest, res: Response) => {
    res.sendStatus(StatusCodes.CONFLICT);
});

export default router;