import { Request, Response, NextFunction } from "express";
import { StatsService } from "./stats.service";

const service = new StatsService();

export const getStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await service.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};
