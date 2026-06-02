import { Router } from "express";
import { getStats } from "./stats.controller";

const router = Router();

router.get("/stats", getStats);

export default router;
