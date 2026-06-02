import { prisma } from "../../lib/prisma";

export class NotificationService {
  async getNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return notifications.map((n) => ({
      ...n,
      metadata: n.metadata ? JSON.parse(n.metadata) : null,
    }));
  }

  async markRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
