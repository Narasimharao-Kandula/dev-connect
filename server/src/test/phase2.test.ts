import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app";
import { prisma } from "../lib/prisma";

let userToken: string;
let userId: string;
const testEmail = "test-phase2@example.com";
const testPassword = "test123456";

describe("Phase 2 — Forgot / Reset Password", () => {
  let resetToken: string;

  beforeAll(async () => {
    // Ensure test user exists for forgot-password tests
    await prisma.user.upsert({
      where: { email: "rahul@example.com" },
      update: {},
      create: {
        email: "rahul@example.com",
        password: await bcrypt.hash("password123", 12),
        name: "Rahul Sharma",
        emailVerified: true,
        onboardingCompleted: true,
        role: "Admin",
      },
    });
  });

  it("POST /api/auth/forgot-password returns success", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "rahul@example.com" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("resetToken");
    resetToken = res.body.resetToken;
  });

  it("POST /api/auth/forgot-password returns same response for unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "nonexistent@example.com" });
    expect(res.status).toBe(200);
  });

  it("POST /api/auth/reset-password with valid token", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: resetToken, password: "newpassword123" });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset successfully/i);
  });

  it("POST /api/auth/login with new password works", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "rahul@example.com", password: "newpassword123" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    // Verify we can still use rahul's account
  });

  it("POST /api/auth/reset-password with expired token fails", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: "invalidtoken", password: "newpassword123" });
    expect(res.status).toBe(400);
  });

  // Reset rahul's password back
  it("Reset rahul's password back to original", async () => {
    const fp = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "rahul@example.com" });
    await request(app)
      .post("/api/auth/reset-password")
      .send({ token: fp.body.resetToken, password: "password123" });
  });
});

describe("Phase 2 — Email Verification", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, password: testPassword, name: "Phase 2 Test" });
    userToken = res.body.token;
    userId = res.body.user.id;
  });

  it("GET /api/auth/me shows email not verified for new user", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.emailVerified).toBe(false);
  });

  it("POST /api/auth/send-verification returns token", async () => {
    const res = await request(app)
      .post("/api/auth/send-verification")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("verificationToken");
    const verifyToken = res.body.verificationToken;

    const verifyRes = await request(app)
      .get(`/api/auth/verify-email/${verifyToken}`);
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.message).toMatch(/verified/i);
  });

  it("GET /api/auth/me shows email verified after verification", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.emailVerified).toBe(true);
  });

  it("POST /api/auth/send-verification fails if already verified", async () => {
    const res = await request(app)
      .post("/api/auth/send-verification")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(400);
  });
});

describe("Phase 2 — Onboarding", () => {
  let newUserToken: string;
  const onboardingEmail = "test-onboarding@example.com";

  it("POST /api/auth/me shows onboarding not completed for new user", async () => {
    await prisma.user.deleteMany({ where: { email: onboardingEmail } });
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: onboardingEmail, password: testPassword, name: "Onboarding Test" });
    newUserToken = reg.body.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${newUserToken}`);
    expect(res.status).toBe(200);
    expect(res.body.onboardingCompleted).toBe(false);
  });

  it("POST /api/auth/onboarding completes all steps", async () => {
    const res = await request(app)
      .post("/api/auth/onboarding")
      .set("Authorization", `Bearer ${newUserToken}`)
      .send({
        bio: "Full-stack developer",
        experience: 5,
        country: "India",
        timezone: "Asia/Kolkata",
        githubUrl: "https://github.com/testuser",
        portfolio: "https://testuser.dev",
        remoteOnly: true,
        openToCollab: true,
        availability: "Available",
        skills: ["React", "Node.js", "TypeScript"],
      });
    expect(res.status).toBe(200);
    expect(res.body.onboardingCompleted).toBe(true);
    expect(res.body.country).toBe("India");
    expect(res.body.profile.bio).toBe("Full-stack developer");
    expect(res.body.skills).toHaveLength(3);
  });

  it("POST /api/auth/onboarding fails if already completed", async () => {
    const res = await request(app)
      .post("/api/auth/onboarding")
      .set("Authorization", `Bearer ${newUserToken}`)
      .send({ bio: "Updated" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already completed/i);
  });
});
