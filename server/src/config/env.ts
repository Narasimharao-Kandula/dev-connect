import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "devconnect-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  SERVER_URL: process.env.SERVER_URL || `http://localhost:${process.env.PORT || "5000"}`,
  NODE_ENV: process.env.NODE_ENV || "development",
  SMTP_HOST: process.env.SMTP_HOST || "smtp.sendgrid.net",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER || "apikey",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || "noreply@devconnect.app",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "",
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "",
};
