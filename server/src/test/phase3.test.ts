import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../app";
import { prisma } from "../lib/prisma";

let user1Token: string;
let user2Token: string;
let user1Id: string;
let user2Id: string;
let projectId: string;
let reviewId: string;
const email1 = "test-p3-user1@example.com";
const email2 = "test-p3-user2@example.com";
const pw = "test123456";

describe("Phase 3 — Reviews & Ratings", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [email1, email2] } } });

    const r1 = await request(app).post("/api/auth/register").send({ email: email1, password: pw, name: "P3 User 1" });
    user1Token = r1.body.token;
    user1Id = r1.body.user.id;

    const r2 = await request(app).post("/api/auth/register").send({ email: email2, password: pw, name: "P3 User 2" });
    user2Token = r2.body.token;
    user2Id = r2.body.user.id;

    // Create a project owned by user1
    const proj = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ name: "Test Project for Review", description: "desc", skills: ["React"] });
    projectId = proj.body.id;

    // Accept collaboration between them
    const reqR = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ receiverId: user1Id, message: "Let's collab" });
    expect(reqR.status).toBe(201);
    const reqId = reqR.body.id;
    const acceptR = await request(app)
      .patch(`/api/requests/${reqId}`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ status: "Accepted" });
    expect(acceptR.status).toBe(200);
  });

  it("POST /api/reviews creates a review", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ reviewedId: user2Id, rating: 5, comment: "Great collaborator!", projectId });
    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(5);
    expect(res.body.comment).toBe("Great collaborator!");
    reviewId = res.body.id;
  });

  it("POST /api/reviews duplicate fails", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ reviewedId: user2Id, rating: 3 });
    expect(res.status).toBe(400);
  });

  it("POST /api/reviews self-review fails", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ reviewedId: user1Id, rating: 5 });
    expect(res.status).toBe(400);
  });

  it("GET /api/reviews/user/:userId returns reviews with average", async () => {
    const res = await request(app).get(`/api/reviews/user/${user2Id}`);
    expect(res.status).toBe(200);
    expect(res.body.reviews).toHaveLength(1);
    expect(res.body.averageRating).toBe(5);
    expect(res.body.totalReviews).toBe(1);
  });

  it("DELETE /api/reviews/:id deletes own review", async () => {
    const res = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(res.status).toBe(200);
    // Verify deleted
    const get = await request(app).get(`/api/reviews/user/${user2Id}`);
    expect(get.body.totalReviews).toBe(0);
  });
});

describe("Phase 3 — Bookmarks", () => {
  it("POST /api/bookmarks/:projectId bookmarks a project", async () => {
    const res = await request(app)
      .post(`/api/bookmarks/${projectId}`)
      .set("Authorization", `Bearer ${user2Token}`);
    expect(res.status).toBe(200);
    expect(res.body.bookmarked).toBe(true);
  });

  it("POST /api/bookmarks/:projectId toggles off", async () => {
    const res = await request(app)
      .post(`/api/bookmarks/${projectId}`)
      .set("Authorization", `Bearer ${user2Token}`);
    expect(res.status).toBe(200);
    expect(res.body.bookmarked).toBe(false);
  });

  it("GET /api/bookmarks returns user's bookmarks", async () => {
    // Bookmark it again
    await request(app).post(`/api/bookmarks/${projectId}`).set("Authorization", `Bearer ${user2Token}`);
    const res = await request(app)
      .get("/api/bookmarks")
      .set("Authorization", `Bearer ${user2Token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].project.id).toBe(projectId);
  });
});

describe("Phase 3 — Search", () => {
  it("GET /api/search?q= returns users and projects", async () => {
    const res = await request(app)
      .get(`/api/search?q=React`)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body).toHaveProperty("projects");
    expect(res.body.projects.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/search?q=&type=users filters by type", async () => {
    const res = await request(app)
      .get(`/api/search?q=P3&type=users`)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThanOrEqual(1);
    expect(res.body).not.toHaveProperty("projects");
  });

  it("GET /api/search without query returns empty", async () => {
    const res = await request(app)
      .get("/api/search")
      .set("Authorization", `Bearer ${user1Token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ users: [], projects: [] });
  });
});

describe("Phase 3 — Activity Feed", () => {
  it("GET /api/feed returns recent activity", async () => {
    const res = await request(app)
      .get("/api/feed")
      .set("Authorization", `Bearer ${user1Token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    const hasNewProject = res.body.some((item: any) => item.type === "new_project");
    expect(hasNewProject).toBe(true);
  });
});
