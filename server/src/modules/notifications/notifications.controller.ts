import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { NotificationService } from "./notifications.service";

const service = new NotificationService();

export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await service.getNotifications(req.user!.userId);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

export const markRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    await service.markRead(id, req.user!.userId);
    res.json({ message: "Marked as read" });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await service.markAllRead(req.user!.userId);
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};
