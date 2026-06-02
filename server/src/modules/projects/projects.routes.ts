import { Router } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "./projects.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.post("/", authenticate, createProject);
router.get("/", authenticate, getProjects);
router.get("/:id", authenticate, getProjectById);
router.patch("/:id", authenticate, updateProject);
router.delete("/:id", authenticate, deleteProject);

export default router;
