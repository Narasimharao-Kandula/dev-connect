import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "Admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
};
