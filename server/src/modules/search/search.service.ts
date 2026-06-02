import { prisma } from "../../lib/prisma";

export class SearchService {
  async search(query: string, type: "users" | "projects" | "all") {
    const q = query.toLowerCase();

    const results: any = {};

    if (type === "users" || type === "all") {
      const users = await prisma.$queryRaw`
        SELECT
          u.id, u.name, u.email, u.avatar, u.country, u.availability,
          p.bio, p.experience, p."remoteOnly", p."openToCollab",
          ts_rank(to_tsvector('english', coalesce(u.name, '') || ' ' || coalesce(p.bio, '')), plainto_tsquery('english', ${q})) AS rank
        FROM "User" u
        LEFT JOIN "Profile" p ON p."userId" = u.id
        WHERE u."deletedAt" IS NULL
          AND (
            u.name ILIKE ${'%' + q + '%'}
            OR p.bio ILIKE ${'%' + q + '%'}
            OR u.country ILIKE ${'%' + q + '%'}
            OR u.email ILIKE ${'%' + q + '%'}
            OR EXISTS (
              SELECT 1 FROM "UserSkill" us
              JOIN "Skill" s ON s.id = us."skillId"
              WHERE us."userId" = u.id AND s.name ILIKE ${'%' + q + '%'}
            )
          )
        ORDER BY rank DESC
        LIMIT 20
      `;

      results.users = (users as any[]).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        country: u.country,
        availability: u.availability,
        profile: u.bio ? { bio: u.bio, experience: u.experience, remoteOnly: u.remoteOnly, openToCollab: u.openToCollab } : null,
      }));
    }

    if (type === "projects" || type === "all") {
      const projects = await prisma.$queryRaw`
        SELECT
          pj.id, pj.name, pj.description, pj.status, pj."createdAt",
          u.id AS "ownerId", u.name AS "ownerName", u.avatar AS "ownerAvatar",
          ts_rank(to_tsvector('english', coalesce(pj.name, '') || ' ' || coalesce(pj.description, '')), plainto_tsquery('english', ${q})) AS rank
        FROM "Project" pj
        JOIN "User" u ON u.id = pj."ownerId"
        WHERE (
          pj.name ILIKE ${'%' + q + '%'}
          OR pj.description ILIKE ${'%' + q + '%'}
          OR EXISTS (
            SELECT 1 FROM "ProjectSkill" ps
            JOIN "Skill" s ON s.id = ps."skillId"
            WHERE ps."projectId" = pj.id AND s.name ILIKE ${'%' + q + '%'}
          )
        )
        ORDER BY rank DESC
        LIMIT 20
      `;

      results.projects = (projects as any[]).map((pj: any) => ({
        id: pj.id,
        name: pj.name,
        description: pj.description,
        status: pj.status,
        createdAt: pj.createdAt,
        owner: { id: pj.ownerId, name: pj.ownerName, avatar: pj.ownerAvatar },
      }));
    }

    return results;
  }

  async suggest(query: string) {
    if (!query || query.trim().length < 1) return { users: [], projects: [], skills: [] };
    const q = query.trim().toLowerCase();

    const [users, projects, skills] = await Promise.all([
      prisma.$queryRaw`
        SELECT id, name, avatar, country, availability
        FROM "User"
        WHERE "deletedAt" IS NULL
          AND (
            name ILIKE ${'%' + q + '%'}
            OR country ILIKE ${'%' + q + '%'}
          )
        ORDER BY
          CASE WHEN name ILIKE ${q + '%'} THEN 0 ELSE 1 END,
          name ASC
        LIMIT 5
      `,
      prisma.$queryRaw`
        SELECT pj.id, pj.name, pj.status, u.name AS "ownerName"
        FROM "Project" pj
        JOIN "User" u ON u.id = pj."ownerId"
        WHERE pj.name ILIKE ${'%' + q + '%'}
        ORDER BY
          CASE WHEN pj.name ILIKE ${q + '%'} THEN 0 ELSE 1 END,
          pj.name ASC
        LIMIT 5
      `,
      prisma.$queryRaw`
        SELECT s.id, s.name, COUNT(us."userId")::int AS "userCount"
        FROM "Skill" s
        LEFT JOIN "UserSkill" us ON us."skillId" = s.id
        WHERE s.name ILIKE ${'%' + q + '%'}
        GROUP BY s.id, s.name
        ORDER BY
          CASE WHEN s.name ILIKE ${q + '%'} THEN 0 ELSE 1 END,
          "userCount" DESC
        LIMIT 5
      `,
    ]);

    return { users, projects, skills };
  }
}
