import { Router } from "express";
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} from "./chat.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.get("/conversations", authenticate, getConversations);
router.post("/conversations", authenticate, getOrCreateConversation);
router.get("/conversations/:id/messages", authenticate, getMessages);
router.post("/conversations/:id/messages", authenticate, sendMessage);

export default router;
