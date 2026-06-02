import rateLimit from "express-rate-limit";

export const requestRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  message: { error: "Daily request limit reached (max 10 per day)" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const sendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: "Too many verification requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
