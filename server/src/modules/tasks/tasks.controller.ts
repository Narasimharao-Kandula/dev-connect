import { TaskService } from "./tasks.service";

const service = new TaskService();

export const getTasks = async (req: any, res: any, next: any) => {
  try {
    const tasks = await service.getByProject(req.params.projectId);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req: any, res: any, next: any) => {
  try {
    const { title, description, assigneeId } = req.body;
    if (!title || typeof title !== "string") {
      res.status(400).json({ error: "Title is required" });
      return;
    }
    const task = await service.create(req.params.projectId, req.user.userId, title, description, assigneeId);
    res.status(201).json(task);
  } catch (err: any) {
    if (err.message?.includes("not found")) {
      res.status(404).json({ error: err.message });
      return;
    }
    next(err);
  }
};

export const updateTask = async (req: any, res: any, next: any) => {
  try {
    const task = await service.update(req.params.id, req.user.userId, req.body);
    res.json(task);
  } catch (err: any) {
    if (err.message?.includes("not found")) {
      res.status(404).json({ error: err.message });
      return;
    }
    next(err);
  }
};

export const deleteTask = async (req: any, res: any, next: any) => {
  try {
    await service.delete(req.params.id, req.user.userId);
    res.json({ message: "Task deleted" });
  } catch (err: any) {
    if (err.message?.includes("not found")) {
      res.status(404).json({ error: err.message });
      return;
    }
    next(err);
  }
};
