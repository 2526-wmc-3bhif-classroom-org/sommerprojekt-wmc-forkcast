import { Router, Request, Response, NextFunction } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    res.status(501).json({ message: "Not implemented" });
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    res.status(501).json({ message: "Not implemented" });
});

export default router;