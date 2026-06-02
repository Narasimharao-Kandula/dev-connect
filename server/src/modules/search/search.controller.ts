import { SearchService } from "./search.service";

const service = new SearchService();

export const search = async (req: any, res: any, next: any) => {
  try {
    const q = (req.query.q as string || "").trim();
    const type = (req.query.type as "users" | "projects" | "all") || "all";
    const filters = {
      availability: req.query.availability as string | undefined,
      skill: req.query.skill as string | undefined,
      remoteOnly: req.query.remoteOnly === "true" ? true : undefined,
      openToCollab: req.query.openToCollab === "true" ? true : undefined,
      minScore: req.query.minScore ? Number(req.query.minScore) : undefined,
      country: req.query.country as string | undefined,
    };
    const hasFilters = Object.values(filters).some((v) => v !== undefined);
    if (!q && !hasFilters) {
      res.json({ users: [], projects: [] });
      return;
    }
    const results = await service.search(q, type, filters, req.user!.userId);
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
