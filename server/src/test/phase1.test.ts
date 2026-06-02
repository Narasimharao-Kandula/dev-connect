import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../app";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

let userToken: string;
let userId: string;
const testEmail = "test-phase1@example.com";
const testPassword = "test123456";

beforeAll(async () => {
  await prisma.contactMessage.deleteMany({ where: { email: testEmail } });
  await prisma.userSkill.deleteMany({ where: { user: { email: testEmail } } });
  await prisma.user.deleteMany({ where: { email: testEmail } });
});

describe("Phase 1 — Health & Stats", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("GET /api/stats returns platform stats", async () => {
    const res = await request(app).get("/api/stats");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalUsers");
    expect(res.body).toHaveProperty("totalCountries");
    expect(res.body).toHaveProperty("totalProjects");
    expect(res.body).toHaveProperty("totalTeams");
    expect(res.body).toHaveProperty("activeThisWeek");
    expect(typeof res.body.totalUsers).toBe("number");
  });
});

describe("Phase 1 — Contact", () => {
  it("POST /api/contact submits a message", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Test User", email: testEmail, subject: "Test", message: "Integration test message" });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Message sent successfully");
  });

  it("POST /api/contact rejects empty name", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "", email: testEmail, subject: "Test", message: "Msg" });
    expect(res.status).toBe(400);
  });

  it("POST /api/contact rejects invalid email", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Test", email: "not-an-email", subject: "Test", message: "Msg" });
    expect(res.status).toBe(400);
  });
});

describe("Phase 1 — Auth", () => {
  it("POST /api/auth/register creates a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, password: testPassword, name: "Test User" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(testEmail);
    userToken = res.body.token;
    userId = res.body.user.id;
  });

  it("POST /api/auth/register rejects duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, password: testPassword, name: "Test User" });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  it("POST /api/auth/login with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: testPassword });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    userToken = res.body.token;
  });

  it("POST /api/auth/login rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  it("GET /api/auth/me returns current user", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testEmail);
  });

  it("GET /api/auth/me rejects without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("Phase 1 — Soft Delete Account Flow", () => {
  it("GET /api/auth/deletion-status shows active initially", async () => {
    const res = await request(app)
      .get("/api/auth/deletion-status")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.scheduled).toBe(false);
  });

  it("POST /api/auth/delete-account schedules deletion", async () => {
    const res = await request(app)
      .post("/api/auth/delete-account")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/scheduled for deletion/i);
    expect(res.body).toHaveProperty("scheduledDate");
  });

  it("POST /api/auth/delete-account fails on second call", async () => {
    const res = await request(app)
      .post("/api/auth/delete-account")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already scheduled/i);
  });

  it("GET /api/auth/deletion-status shows scheduled", async () => {
    const res = await request(app)
      .get("/api/auth/deletion-status")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.scheduled).toBe(true);
    expect(res.body.daysLeft).toBeGreaterThan(0);
    expect(res.body.canCancel).toBe(true);
  });

  it("POST /api/auth/login blocks deleted account", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: testPassword });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/scheduled for deletion/i);
  });

  it("POST /api/auth/cancel-deletion restores account", async () => {
    const res = await request(app)
      .post("/api/auth/cancel-deletion")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/cancelled/i);
  });

  it("GET /api/auth/deletion-status shows active after cancel", async () => {
    const res = await request(app)
      .get("/api/auth/deletion-status")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.scheduled).toBe(false);
  });

  it("POST /api/auth/login works again after cancel", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: testPassword });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    userToken = res.body.token;
  });
});
