import { Router } from "express";
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} from "./chat.controller";
import { authenticate } from "../../middleware/auth";
import { chatLimiter } from "../../middleware/rateLimit";

const router = Router();

router.get("/conversations", authenticate, chatLimiter, getConversations);
router.post("/conversations", authenticate, chatLimiter, getOrCreateConversation);
router.get("/conversations/:id/messages", authenticate, chatLimiter, getMessages);
router.post("/conversations/:id/messages", authenticate, chatLimiter, sendMessage);

export default router;
