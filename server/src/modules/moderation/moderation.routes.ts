import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as ctrl from "./moderation.controller";

const router = Router();

router.post("/users/:userId/block", authenticate, ctrl.block);
router.delete("/users/:userId/block", authenticate, ctrl.unblock);
router.get("/blocked", authenticate, ctrl.listBlocked);
router.post("/users/:userId/report", authenticate, ctrl.report);

export default router;
