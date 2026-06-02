import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app";
import { prisma } from "../lib/prisma";

let userToken: string;
let userId: string;
let adminToken: string;
let projectId: string;
let taskId: string;
const email = "test-p4@example.com";
const adminEmail = "test-admin-p4@example.com";
const pw = "test123456";

describe("Phase 4 — Tasks", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.user.deleteMany({ where: { email: adminEmail } });
    const reg = await request(app).post("/api/auth/register").send({ email, password: pw, name: "P4 User" });
    userToken = reg.body.token;
    userId = reg.body.user.id;

    // Create a dedicated admin user for tests
    const hashedPw = await bcrypt.hash(pw, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPw,
        name: "Admin Test",
        role: "Admin",
        emailVerified: true,
        onboardingCompleted: true,
      },
    });
    const login = await request(app).post("/api/auth/login").send({ email: adminEmail, password: pw });
    adminToken = login.body.token;

    const proj = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "P4 Project", description: "desc", skills: ["React"] });
    projectId = proj.body.id;
  });

  it("GET /api/tasks/:projectId returns empty list", async () => {
    const res = await request(app)
      .get(`/api/tasks/${projectId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("POST /api/tasks/:projectId creates a task", async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Setup CI/CD" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Setup CI/CD");
    expect(res.body.status).toBe("Todo");
    taskId = res.body.id;
  });

  it("PATCH /api/tasks/:id updates status", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "InProgress" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("InProgress");
  });

  it("DELETE /api/tasks/:id deletes task", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const get = await request(app)
      .get(`/api/tasks/${projectId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(get.body).toHaveLength(0);
  });

  it("POST /api/tasks/:projectId requires title", async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
  });
});

describe("Phase 4 — Following", () => {
  it("POST /api/follow/:userId follows a user", async () => {
    const res = await request(app)
      .post(`/api/follow/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.following).toBe(true);
  });

  it("POST /api/follow/:userId toggles unfollow", async () => {
    const res = await request(app)
      .post(`/api/follow/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.following).toBe(false);
  });

  it("POST /api/follow/:userId self-follow fails", async () => {
    const res = await request(app)
      .post(`/api/follow/${userId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(400);
  });

  it("GET /api/follow/following returns list", async () => {
    // follow first
    await request(app).post(`/api/follow/${userId}`).set("Authorization", `Bearer ${adminToken}`);
    const res = await request(app)
      .get("/api/follow/following")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].followed.id).toBe(userId);
  });

  it("GET /api/follow/followers returns list", async () => {
    const res = await request(app)
      .get("/api/follow/followers")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].follower.id).toBeDefined();
  });
});

describe("Phase 4 — Admin", () => {
  it("GET /api/admin/stats returns stats", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalUsers");
    expect(res.body).toHaveProperty("totalProjects");
  });

  it("GET /api/admin/stats fails for non-admin", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it("GET /api/admin/users returns users", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty("role");
  });

  it("PATCH /api/admin/users/:userId/role promotes/demotes", async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${userId}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "Admin" });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe("Admin");
    // Demote back
    await request(app)
      .patch(`/api/admin/users/${userId}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "User" });
  });
});
