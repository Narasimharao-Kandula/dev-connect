import { prisma } from "../../lib/prisma";

export class ActivityService {
  async getProjectActivities(projectId: string) {
    return prisma.projectActivity.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async logActivity(projectId: string, userId: string, type: string, message: string, metadata?: any) {
    return prisma.projectActivity.create({
      data: { projectId, userId, type, message, metadata: metadata || undefined },
    });
  }
}
