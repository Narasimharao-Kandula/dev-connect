import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { NotificationService } from "./notifications.service";

const service = new NotificationService();

export const getNotifications = async (req: AuthRequest, res: Response) => {
  const cursor = req.query.cursor as string | undefined;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await service.getNotifications(req.user!.userId, cursor, limit);
  res.json(result);
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  const count = await service.getUnreadCount(req.user!.userId);
  res.json({ count });
};

export const markRead = async (req: AuthRequest, res: Response) => {
  await service.markRead(req.params.id, req.user!.userId);
  res.json({ success: true });
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  await service.markAllRead(req.user!.userId);
  res.json({ success: true });
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  await service.deleteNotification(req.params.id, req.user!.userId);
  res.json({ success: true });
};

export const getPreferences = async (req: AuthRequest, res: Response) => {
  const prefs = await service.getPreferences(req.user!.userId);
  res.json(prefs);
};

export const updatePreference = async (req: AuthRequest, res: Response) => {
  const { type, email } = req.body;
  if (!type) return res.status(400).json({ error: "Type is required" });
  const pref = await service.upsertPreference(req.user!.userId, type, email);
  res.json(pref);
};
