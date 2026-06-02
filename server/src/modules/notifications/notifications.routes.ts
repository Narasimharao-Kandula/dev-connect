import { Router } from "express";
import { getNotifications, getUnreadCount, markRead, markAllRead, deleteNotification, getPreferences, updatePreference } from "./notifications.controller";
import { authenticate } from "../../middleware/auth";
import { notificationLimiter } from "../../middleware/rateLimit";

const router = Router();

router.get("/", authenticate, notificationLimiter, getNotifications);
router.get("/unread-count", authenticate, notificationLimiter, getUnreadCount);
router.get("/preferences", authenticate, notificationLimiter, getPreferences);
router.put("/preferences", authenticate, notificationLimiter, updatePreference);
router.patch("/:id/read", authenticate, notificationLimiter, markRead);
router.post("/read-all", authenticate, notificationLimiter, markAllRead);
router.delete("/:id", authenticate, notificationLimiter, deleteNotification);

export default router;
