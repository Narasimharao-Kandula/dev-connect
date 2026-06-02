import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { getActivities } from "./activity.controller";

const router = Router();

router.get("/projects/:projectId/activities", authenticate, getActivities);

export default router;
