import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types";
import { AuthService } from "./auth.service";

const service = new AuthService();

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const onboardingSchema = z.object({
  bio: z.string().max(500).optional(),
  experience: z.number().min(0).max(50).optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolio: z.string().url().optional().or(z.literal("")),
  remoteOnly: z.boolean().optional(),
  openToCollab: z.boolean().optional(),
  availability: z.enum(["Available", "Busy", "LookingForTeam"]).optional(),
  skills: z.array(z.string().min(1)).optional(),
});

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const result = await service.register(email, password, name);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await service.login(email, password);
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};

export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await service.getMe(req.user!.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// ─── Forgot / Reset Password ───────────────────────────

export const forgotPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await service.forgotPassword(email);
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};

export const resetPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const result = await service.resetPassword(token, password);
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};

// ─── Email Verification ─────────────────────────────────

export const sendVerification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await service.sendVerification(req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.params.token as string;
    const result = await service.verifyEmail(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ─── Onboarding ──────────────────────────────────────────

export const completeOnboarding = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = onboardingSchema.parse(req.body);
    const result = await service.completeOnboarding(req.user!.userId, data);
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};

// ─── Account Deletion ────────────────────────────────────

export const deleteAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await service.deleteAccount(req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const cancelDeletion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await service.cancelDeletion(req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deletionStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await service.getDeletionStatus(req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    await service.changePassword(req.user!.userId, currentPassword, newPassword);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};

export const getAccounts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const accounts = await service.getAccounts(req.user!.userId);
    res.json(accounts);
  } catch (err) {
    next(err);
  }
};
