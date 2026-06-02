import { FeedService } from "./feed.service";
import { AuthRequest } from "../../types";

const service = new FeedService();

export const getFeed = async (req: AuthRequest, res: any, next: any) => {
  try {
    const feed = await service.getFeed(req.user?.userId);
    res.json(feed);
  } catch (err) {
    next(err);
  }
};
