import { AdminService } from "./admin.service";

const service = new AdminService();

export const getAdminStats = async (_req: any, res: any, next: any) => {
  try {
    const stats = await service.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

export const getAdminUsers = async (req: any, res: any, next: any) => {
  try {
    const users = await service.getUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req: any, res: any, next: any) => {
  try {
    const { role } = req.body;
    if (!role || !["User", "Admin"].includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }
    const user = await service.updateRole(req.params.userId, role);
    res.json(user);
  } catch (err: any) {
    if (err.message?.includes("not found")) {
      res.status(404).json({ error: err.message });
      return;
    }
    next(err);
  }
};

export const deleteUser = async (req: any, res: any, next: any) => {
  try {
    await service.deleteUser(req.params.userId);
    res.json({ message: "User deleted" });
  } catch (err: any) {
    if (err.message?.includes("not found")) {
      res.status(404).json({ error: err.message });
      return;
    }
    next(err);
  }
};
