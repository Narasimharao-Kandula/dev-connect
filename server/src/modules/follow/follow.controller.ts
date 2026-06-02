import { FollowService } from "./follow.service";

const service = new FollowService();

export const toggleFollow = async (req: any, res: any, next: any) => {
  try {
    const result = await service.toggle(req.user.userId, req.params.userId);
    res.json(result);
  } catch (err: any) {
    if (err.message?.includes("Cannot follow yourself")) {
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  }
};

export const getFollowing = async (req: any, res: any, next: any) => {
  try {
    const following = await service.getFollowing(req.user.userId);
    res.json(following);
  } catch (err) {
    next(err);
  }
};

export const getFollowers = async (req: any, res: any, next: any) => {
  try {
    const followers = await service.getFollowers(req.user.userId);
    res.json(followers);
  } catch (err) {
    next(err);
  }
};
