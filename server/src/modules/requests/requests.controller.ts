import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types";
import { RequestService } from "./requests.service";

const service = new RequestService();

const sendSchema = z.object({
  receiverId: z.string().uuid(),
  message: z.string().max(500).optional(),
});

const respondSchema = z.object({
  status: z.enum(["Accepted", "Rejected"]),
});

export const sendRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { receiverId, message } = sendSchema.parse(req.body);
    const request = await service.send(req.user!.userId, receiverId, message);
    res.status(201).json(request);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};

export const respondToRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const { status } = respondSchema.parse(req.body);
    const result = await service.respond(id, req.user!.userId, status);
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};

export const getReceivedRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const requests = await service.getReceived(req.user!.userId);
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

export const getSentRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const requests = await service.getSent(req.user!.userId);
    res.json(requests);
  } catch (err) {
    next(err);
  }
};
