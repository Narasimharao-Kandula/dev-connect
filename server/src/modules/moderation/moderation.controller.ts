import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import * as service from "./moderation.service";

export const block = async (req: AuthRequest, res: Response) => {
  try {
    await service.blockUser(req.user!.userId, req.params.userId);
    res.json({ message: "User blocked" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const unblock = async (req: AuthRequest, res: Response) => {
  try {
    await service.unblockUser(req.user!.userId, req.params.userId);
    res.json({ message: "User unblocked" });
  } catch {
    res.status(404).json({ error: "Block not found" });
  }
};

export const listBlocked = async (req: AuthRequest, res: Response) => {
  const blocked = await service.getBlockedUsers(req.user!.userId);
  res.json(blocked);
};

export const report = async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: "Reason is required" });
    await service.reportUser(req.user!.userId, req.params.userId, reason);
    res.json({ message: "User reported" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
