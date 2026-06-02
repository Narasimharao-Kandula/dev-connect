import { ActivityService } from "./activity.service";

const service = new ActivityService();

export const getActivities = async (req: any, res: any, next: any) => {
  try {
    const activities = await service.getProjectActivities(req.params.projectId);
    res.json(activities);
  } catch (err) {
    next(err);
  }
};
