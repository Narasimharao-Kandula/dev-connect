import { AchievementsService } from "./achievements.service";

const service = new AchievementsService();

export const getAllAchievements = async (_req: any, res: any, next: any) => {
  try { res.json(await service.getAll()); } catch (err) { next(err); }
};

export const getUserAchievements = async (req: any, res: any, next: any) => {
  try { res.json(await service.getUserAchievements(req.user!.userId)); } catch (err) { next(err); }
};

export const checkAchievements = async (req: any, res: any, next: any) => {
  try { res.json(await service.checkAndAward(req.user!.userId)); } catch (err) { next(err); }
};
