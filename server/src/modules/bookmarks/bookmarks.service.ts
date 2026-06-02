import { prisma } from "../../lib/prisma";

export class BookmarkService {
  async toggle(userId: string, projectId: string) {
    const existing = await prisma.bookmark.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { userId_projectId: { userId, projectId } } });
      return { bookmarked: false };
    }

    await prisma.bookmark.create({ data: { userId, projectId } });
    return { bookmarked: true };
  }

  async getUserBookmarks(userId: string) {
    return prisma.bookmark.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            owner: { select: { id: true, name: true, avatar: true } },
            skills: { include: { skill: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
