import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { getTasks, createTask, updateTask, deleteTask } from "./tasks.controller";

const router = Router();

router.get("/:projectId", authenticate, getTasks);
router.post("/:projectId", authenticate, createTask);
router.patch("/:id", authenticate, updateTask);
router.delete("/:id", authenticate, deleteTask);

export default router;
