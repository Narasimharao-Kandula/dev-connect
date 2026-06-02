import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { MatchService } from "./match.service";

const service = new MatchService();

export const getMatchingDevelopers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = req.params.projectId as string;
    const matches = await service.findMatchingDevelopers(projectId);
    res.json(matches);
  } catch (err) {
    next(err);
  }
};

export const getMatchingProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const matches = await service.findMatchingProjects(req.user!.userId);
    res.json(matches);
  } catch (err) {
    next(err);
  }
};

export const getRecommendedSkills = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const recommendations = await service.recommendSkills(req.user!.userId);
    res.json(recommendations);
  } catch (err) {
    next(err);
  }
};

export const getTeamRecommendation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = req.params.projectId as string;
    const team = await service.recommendTeam(projectId);
    res.json(team);
  } catch (err) {
    next(err);
  }
};

export const findMatchingDevelopersHandler = getMatchingDevelopers;
export const findMatchingProjectsHandler = getMatchingProjects;
