import { prisma } from "../../lib/prisma";

export class ExportService {
  async exportUserData(userId: string) {
    const [user, projects, requests, notifications, reviews, conversations, messages] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          skills: { include: { skill: true } },
        },
      }),
      prisma.project.findMany({
        where: { ownerId: userId },
        include: { skills: { include: { skill: true } }, team: { include: { members: { include: { user: { select: { id: true, name: true } } } } } } },
      }),
      prisma.collaborationRequest.findMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
        include: { sender: { select: { id: true, name: true } }, receiver: { select: { id: true, name: true } } },
      }),
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.review.findMany({
        where: { OR: [{ reviewerId: userId }, { reviewedId: userId }] },
        include: { reviewer: { select: { id: true, name: true } }, reviewed: { select: { id: true, name: true } }, project: { select: { id: true, name: true } } },
      }),
      prisma.conversationParticipant.findMany({
        where: { userId },
        include: { conversation: { include: { participants: { include: { user: { select: { id: true, name: true } } } } } } },
      }),
      prisma.message.findMany({ where: { senderId: userId }, orderBy: { createdAt: "desc" }, take: 500 }),
    ]);

    return { user, projects, requests, notifications, reviews, conversations, messages };
  }
}
