import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types";
import { ChatService } from "./chat.service";

const service = new ChatService();

export const getConversations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const conversations = await service.getConversations(req.user!.userId);
    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

const createConvSchema = z.object({
  userId: z.string().uuid(),
});

export const getOrCreateConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = createConvSchema.parse(req.body);
    const conversation = await service.getOrCreateConversation(
      req.user!.userId,
      userId
    );
    res.json(conversation);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};

export const getMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const messages = await service.getMessages(id, req.user!.userId);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

const sendMsgSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const { content } = sendMsgSchema.parse(req.body);
    const message = await service.sendMessage(id, req.user!.userId, content);
    res.status(201).json(message);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};
