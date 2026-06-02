import { prisma } from "../../lib/prisma";

export class StatsService {
  async getStats() {
    const [
      totalUsers,
      totalProjects,
      totalTeams,
      countries,
      activeThisWeek,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.project.count(),
      prisma.team.count(),
      prisma.user.findMany({
        where: { deletedAt: null, country: { not: null } },
        select: { country: true },
        distinct: ["country"],
      }),
      prisma.user.count({
        where: {
          deletedAt: null,
          lastActive: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      totalUsers,
      totalCountries: countries.length,
      totalProjects,
      totalTeams,
      activeThisWeek,
    };
  }
}
