import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types";
import { TeamService } from "./teams.service";

const service = new TeamService();

export const createTeam = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = req.params.projectId as string;
    const team = await service.createTeam(projectId, req.user!.userId);
    res.status(201).json(team);
  } catch (err) {
    next(err);
  }
};

const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.string().min(1).max(50),
});

export const addMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const { userId, role } = addMemberSchema.parse(req.body);
    const member = await service.addMember(id, userId, role, req.user!.userId);
    res.status(201).json(member);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};

export const removeMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const memberUserId = req.params.userId as string;
    const result = await service.removeMember(id, memberUserId, req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getTeamMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const messages = await service.getMessages(id, req.user!.userId);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

const sendMsgSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const sendTeamMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const { content } = sendMsgSchema.parse(req.body);
    const message = await service.sendMessage(id, req.user!.userId, content);
    res.status(201).json(message);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};
