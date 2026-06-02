import { SearchService } from "./search.service";

const service = new SearchService();

export const search = async (req: any, res: any, next: any) => {
  try {
    const q = (req.query.q as string || "").trim();
    const type = (req.query.type as "users" | "projects" | "all") || "all";
    if (!q) {
      res.json({ users: [], projects: [] });
      return;
    }
    const results = await service.search(q, type);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

export const suggest = async (req: any, res: any, next: any) => {
  try {
    const q = (req.query.q as string || "").trim();
    const results = await service.suggest(q);
    res.json(results);
  } catch (err) {
    next(err);
  }
};
