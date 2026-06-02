import { prisma } from "../../lib/prisma";

interface SearchFilters {
  availability?: string;
  skill?: string;
  remoteOnly?: boolean;
  openToCollab?: boolean;
  minScore?: number;
  country?: string;
}

export class SearchService {
  async search(query: string, type: "users" | "projects" | "all", filters: SearchFilters = {}, userId?: string) {
    const q = query.toLowerCase();

    const results: any = {};

    if (type === "users" || type === "all") {
      const conditions: string[] = ['u."deletedAt" IS NULL'];
      const params: any[] = [];

      if (userId) {
        conditions.push(`NOT EXISTS (
          SELECT 1 FROM "Block" b
          WHERE (b."blockerId" = $${params.length + 1} AND b."blockedId" = u.id)
             OR (b."blockerId" = u.id AND b."blockedId" = $${params.length + 1})
        )`);
        params.push(userId);
      }

      if (q) {
        conditions.push(`(
          u.name ILIKE $${params.length + 1}
          OR p.bio ILIKE $${params.length + 1}
          OR u.country ILIKE $${params.length + 1}
          OR u.email ILIKE $${params.length + 1}
          OR EXISTS (
            SELECT 1 FROM "UserSkill" us
            JOIN "Skill" s ON s.id = us."skillId"
            WHERE us."userId" = u.id AND s.name ILIKE $${params.length + 1}
          )
        )`);
        params.push(`%${q}%`);
      }

      if (filters.availability) {
        conditions.push(`u.availability = $${params.length + 1}::"Availability"`);
        params.push(filters.availability);
      }

      if (filters.country) {
        conditions.push(`u.country ILIKE $${params.length + 1}`);
        params.push(`%${filters.country}%`);
      }

      if (filters.remoteOnly !== undefined) {
        conditions.push(`p."remoteOnly" = $${params.length + 1}`);
        params.push(filters.remoteOnly);
      }

      if (filters.openToCollab !== undefined) {
        conditions.push(`p."openToCollab" = $${params.length + 1}`);
        params.push(filters.openToCollab);
      }

      if (filters.minScore !== undefined) {
        conditions.push(`u."collaborationScore" >= $${params.length + 1}`);
        params.push(filters.minScore);
      }

      if (filters.skill) {
        conditions.push(`EXISTS (
          SELECT 1 FROM "UserSkill" us2
          JOIN "Skill" s2 ON s2.id = us2."skillId"
          WHERE us2."userId" = u.id AND s2.name ILIKE $${params.length + 1}
        )`);
        params.push(`%${filters.skill}%`);
      }

      const whereClause = conditions.join(" AND ");

      const rankParam = q ? `plainto_tsquery('english', $${params.length + 1})` : "'a'";
      const tsvector = `to_tsvector('english', coalesce(u.name, '') || ' ' || coalesce(p.bio, ''))`;

      const users = await prisma.$queryRawUnsafe(`
        SELECT
          u.id, u.name, u.email, u.avatar, u.country, u.availability, u."collaborationScore",
          p.bio, p.experience, p."remoteOnly", p."openToCollab",
          ts_rank(${tsvector}, ${rankParam}) AS rank
        FROM "User" u
        LEFT JOIN "Profile" p ON p."userId" = u.id
        WHERE ${whereClause}
        ORDER BY rank DESC, u.name ASC
        LIMIT 20
      `, ...params, ...(q ? [q] : []));

      results.users = (users as any[]).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        country: u.country,
        availability: u.availability,
        collaborationScore: u.collaborationScore,
        profile: u.bio ? { bio: u.bio, experience: u.experience, remoteOnly: u.remoteOnly, openToCollab: u.openToCollab } : null,
      }));
    }

    if (type === "projects" || type === "all") {
      const projects = await prisma.$queryRaw`
        SELECT
          pj.id, pj.name, pj.description, pj.status, pj."createdAt",
          u.id AS "ownerId", u.name AS "ownerName", u.avatar AS "ownerAvatar",
          ts_rank(to_tsvector('english', coalesce(pj.name, '') || ' ' || coalesce(pj.description, '')), plainto_tsquery('english', ${q || 'a'})) AS rank
        FROM "Project" pj
        JOIN "User" u ON u.id = pj."ownerId"
        WHERE (
          pj.name ILIKE ${'%' + (q || '__NULL__') + '%'}
          OR pj.description ILIKE ${'%' + (q || '__NULL__') + '%'}
          OR EXISTS (
            SELECT 1 FROM "ProjectSkill" ps
            JOIN "Skill" s ON s.id = ps."skillId"
            WHERE ps."projectId" = pj.id AND s.name ILIKE ${'%' + (q || '__NULL__') + '%'}
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
