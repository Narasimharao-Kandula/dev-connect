import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types";
import { UserService } from "./users.service";

const service = new UserService();

export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const q = req.query as Record<string, string>;
    const skill = q.skill, country = q.country, experience = q.experience, remoteOnly = q.remoteOnly, openToCollab = q.openToCollab, search = q.search, availability = q.availability, minScore = q.minScore;
    const users = await service.getUsers({
      skill,
      country,
      experience,
      remoteOnly,
      openToCollab,
      search,
      availability,
      minScore,
      currentUserId: req.user!.userId,
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const user = await service.getUserById(id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const profileSchema = z.object({
  bio: z.string().max(500).optional(),
  experience: z.number().min(0).max(50).optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolio: z.string().url().optional().or(z.literal("")),
  remoteOnly: z.boolean().optional(),
  openToCollab: z.boolean().optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  name: z.string().min(2).max(100).optional(),
});

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = profileSchema.parse(req.body);
    const user = await service.updateProfile(req.user!.userId, data);
    res.json(user);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};

const skillsSchema = z.object({
  skills: z.array(z.string().min(1)).min(1, "At least one skill required"),
});

export const updateSkills = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skills } = skillsSchema.parse(req.body);
    const result = await service.updateSkills(req.user!.userId, skills);
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};

const availabilitySchema = z.object({
  availability: z.enum(["Available", "Busy", "LookingForTeam"]),
});

export const updateAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { availability } = availabilitySchema.parse(req.body);
    const result = await service.updateAvailability(
      req.user!.userId,
      availability
    );
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};
