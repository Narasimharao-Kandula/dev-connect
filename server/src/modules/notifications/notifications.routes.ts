import { Router } from "express";
import { getNotifications, markRead, markAllRead } from "./notifications.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.get("/", authenticate, getNotifications);
router.patch("/:id/read", authenticate, markRead);
router.post("/read-all", authenticate, markAllRead);

export default router;
