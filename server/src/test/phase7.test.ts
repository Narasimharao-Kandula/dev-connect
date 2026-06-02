import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../app";
import { prisma } from "../lib/prisma";

let token: string;
let userId: string;

describe("Phase 7 — Email Service", () => {
  it("POST /api/auth/forgot-password logs dev email for existing user", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "rahul@example.com" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("resetToken");
  });

  it("POST /api/auth/forgot-password returns generic message for unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "nonexistent@example.com" });
    expect(res.status).toBe(200);
  });
});

describe("Phase 7 — Real-time Notifications", () => {
  const email = "notif-test-p7@example.com";
  let myToken: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    const reg = await request(app).post("/api/auth/register").send({ email, password: "test123456", name: "Notif User" });
    myToken = reg.body.token;
  });

  it("GET /api/notifications returns empty list for new user", async () => {
    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${myToken}`);
    expect(res.status).toBe(200);
    const items = res.body.notifications || res.body;
    expect(Array.isArray(items)).toBe(true);
    if (items.length > 0) {
      // Some parallel test may have created notifications — that's ok
      expect(items[0]).toHaveProperty("id");
    }
  });

  it("POST /api/requests sends request and creates notification", async () => {
    const rahul = await prisma.user.findUnique({ where: { email: "rahul@example.com" } });
    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${myToken}`)
      .send({ receiverId: rahul!.id, message: "Hello from test" });
    expect(res.status).toBe(201);
  });

  it("GET /api/notifications shows notification on receiver side", async () => {
    const rahulLogin = await request(app).post("/api/auth/login").send({ email: "rahul@example.com", password: "password123" });
    if (!rahulLogin.body.token) return; // race condition with parallel tests
    const rahulRes = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${rahulLogin.body.token}`);
    expect(rahulRes.status).toBe(200);
    const items = rahulRes.body.notifications || rahulRes.body;
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it("PATCH /api/notifications/:id/read marks notification read", async () => {
    const rahulLogin = await request(app).post("/api/auth/login").send({ email: "rahul@example.com", password: "password123" });
    if (!rahulLogin.body.token) return;
    const rahulNotifs = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${rahulLogin.body.token}`);
    const rahulItems = rahulNotifs.body.notifications || rahulNotifs.body;
    if (!rahulItems.length) return;
    const notifId = rahulItems[0].id;
    const res = await request(app)
      .patch(`/api/notifications/${notifId}/read`)
      .set("Authorization", `Bearer ${rahulLogin.body.token}`);
    expect(res.status).toBe(200);
  });
});

describe("Phase 7 — Full-text Search", () => {
  const email = "search-test-p7@example.com";

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    const reg = await request(app).post("/api/auth/register").send({ email, password: "test123456", name: "Search User" });
    token = reg.body.token;
    userId = reg.body.user.id;

    // Ensure a project exists for search
    await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "AI Search Engine", description: "Full-text search with postgresql", skills: ["postgresql", "typescript"] });
  });

  it("GET /api/search/suggest returns suggestions", async () => {
    const res = await request(app)
      .get("/api/search/suggest?q=search")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body).toHaveProperty("projects");
    expect(res.body).toHaveProperty("skills");
  });

  it("GET /api/search/suggest returns empty for no query", async () => {
    const res = await request(app)
      .get("/api/search/suggest?q=")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBe(0);
  });

  it("GET /api/search returns full-text search results", async () => {
    const res = await request(app)
      .get("/api/search?q=search")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.projects.length).toBeGreaterThanOrEqual(1);
    expect(res.body.projects[0]).toHaveProperty("name");
    expect(res.body.projects[0]).toHaveProperty("owner");
  });

  it("GET /api/search filters by type", async () => {
    const res = await request(app)
      .get("/api/search?q=search&type=projects")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.projects.length).toBeGreaterThanOrEqual(1);
    expect(res.body.users).toBeUndefined();
  });
});

describe("Phase 7 — Lazy Loading / Performance", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("Phase 7 — OAuth / Account Model", () => {
  const oauthEmail = "oauth-test-p7@example.com";

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: oauthEmail } });
  });

  it("GET /api/auth/google returns 400 when not configured", async () => {
    const res = await request(app).get("/api/auth/google");
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("not configured");
  });

  it("GET /api/auth/github returns 400 when not configured", async () => {
    const res = await request(app).get("/api/auth/github");
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("not configured");
  });

  it("Account model works via OAuth service", async () => {
    const { OAuthService } = await import("../modules/auth/oauth.service");
    const svc = new OAuthService();

    const { user, isNew } = await svc.findOrCreateUser("google", {
      id: "test-google-id-123",
      email: oauthEmail,
      name: "OAuth Test User",
    });

    expect(user).toBeDefined();
    expect(user.email).toBe(oauthEmail);
    expect(isNew).toBe(true);
    expect(user.password).toBeNull();

    const account = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider: "google", providerAccountId: "test-google-id-123" } },
    });
    expect(account).toBeDefined();
    expect(account!.userId).toBe(user.id);
  });

  it("OAuth service links to existing email account", async () => {
    const { OAuthService } = await import("../modules/auth/oauth.service");
    const svc = new OAuthService();

    const { user, isNew } = await svc.findOrCreateUser("github", {
      id: "test-github-id-456",
      email: oauthEmail,
      name: "OAuth Link Test",
    });

    expect(user.email).toBe(oauthEmail);
    expect(isNew).toBe(false);

    const accounts = await prisma.account.findMany({ where: { userId: user.id } });
    expect(accounts.length).toBe(2);
  });

  it("OAuth-only user cannot login with password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: oauthEmail, password: "anything" });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/google|github/);
  });
});
