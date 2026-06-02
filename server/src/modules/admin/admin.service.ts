import { prisma } from "../../lib/prisma";

export class AdminService {
  async getStats() {
    const [totalUsers, totalProjects, totalTeams, totalReviews, totalTasks] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.project.count(),
      prisma.team.count(),
      prisma.review.count(),
      prisma.task.count(),
    ]);
    return { totalUsers, totalProjects, totalTeams, totalReviews, totalTasks };
  }

  async getUsers() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true, email: true, name: true, role: true, country: true,
        availability: true, emailVerified: true, onboardingCompleted: true,
        createdAt: true, lastActive: true,
        _count: { select: { ownedProjects: true, reviewsReceived: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateRole(userId: string, role: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    return prisma.user.update({ where: { id: userId }, data: { role: role as any } });
  }

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }
}
