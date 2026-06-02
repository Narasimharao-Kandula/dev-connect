import { ExportService } from "./export.service";

const service = new ExportService();

export const exportData = async (req: any, res: any, next: any) => {
  try {
    const data = await service.exportUserData(req.user!.userId);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="devconnect-export-${req.user!.userId}.json"`);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
