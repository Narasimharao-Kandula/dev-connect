import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types";
import { ProjectService } from "./projects.service";

const service = new ProjectService();

const createSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  skills: z.array(z.string().min(1)).min(1, "At least one skill required"),
});

const updateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["Planning", "InProgress", "Completed", "Archived"]).optional(),
  skills: z.array(z.string().min(1)).optional(),
});

export const createProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, skills } = createSchema.parse(req.body);
    const project = await service.create(req.user!.userId, name, description, skills);
    res.status(201).json(project);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};

export const getProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const projects = await service.findAll(req.user!.userId);
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const project = await service.findById(id);
    res.json(project);
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const data = updateSchema.parse(req.body);
    const project = await service.update(id, req.user!.userId, {
      name: data.name,
      description: data.description,
      status: data.status,
      skillNames: data.skills,
    });
    res.json(project);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};

export const deleteProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const result = await service.remove(id, req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
