import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { exportData } from "./export.controller";

const router = Router();

router.get("/export", authenticate, exportData);

export default router;
