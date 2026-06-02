import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors";
import multer from "multer";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.message?.startsWith("Only image files") || err.message?.startsWith("Unexpected field") || err.message?.startsWith("File too large")) {
    res.status(400).json({ error: err.message });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
};
