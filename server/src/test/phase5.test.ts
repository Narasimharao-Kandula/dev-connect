import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import path from "path";
import app from "../app";
import { prisma } from "../lib/prisma";

const email = "test-p5@example.com";
const pw = "test123456";
let token: string;
let userId: string;

describe("Phase 5 — Avatar Upload", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    const reg = await request(app).post("/api/auth/register").send({ email, password: pw, name: "P5 User" });
    token = reg.body.token;
    userId = reg.body.user.id;
  });

  it("POST /api/upload/avatar rejects without file", async () => {
    const res = await request(app)
      .post("/api/upload/avatar")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no file/i);
  });

  it("POST /api/upload/avatar rejects non-image file", async () => {
    const res = await request(app)
      .post("/api/upload/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", Buffer.from("not an image"), "test.txt");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/only image/i);
  });

  it("POST /api/upload/avatar rejects without auth", async () => {
    const res = await request(app).post("/api/upload/avatar");
    expect(res.status).toBe(401);
  });

  it("POST /api/upload/avatar uploads and sets avatar url", async () => {
    // Create a minimal valid PNG (1x1 pixel)
    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG header
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
      0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x00, 0x03, 0x00, 0x01, 0x36, 0x28, 0x19,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
      0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    const res = await request(app)
      .post("/api/upload/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", png, { filename: "avatar.png", contentType: "image/png" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("avatar");
    expect(res.body.avatar).toMatch(/^\/uploads\/\d+-[a-z0-9]+\.png$/);
    expect(res.body.id).toBe(userId);
  });
});
