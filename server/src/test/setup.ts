import { execSync } from "child_process";
import { prisma } from "../lib/prisma";

beforeAll(async () => {
  execSync("npx prisma migrate deploy", { stdio: "pipe" });
});

afterAll(async () => {
  await prisma.$disconnect();
});
