import { prisma } from "../../lib/prisma";
import { sendNotificationEmail } from "../../lib/email";

export class NotificationService {
  async createAndNotify(userId: string, type: string, message: string, metadata?: any) {
    const [notif, user] = await Promise.all([
      prisma.notification.create({
        data: {
          userId,
          type,
          message,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      }),
    ]);

    const pref = await prisma.notificationPreference.findUnique({
      where: { userId_type: { userId, type } },
    });

    if (user && (pref?.email ?? true)) {
      sendNotificationEmail(user.email, user.name, type, message).catch(() => {});
    }

    const { getIO } = await import("../../socket");
    const io = getIO();
    io.to(`user:${userId}`).emit("notification:new", {
      ...notif,
      metadata: metadata || null,
    });

    return notif;
  }

  async getNotifications(userId: string, cursor?: string, limit = 20) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    });

    const hasMore = notifications.length > limit;
    const result = hasMore ? notifications.slice(0, limit) : notifications;

    return {
      notifications: result.map((n) => ({
        ...n,
        metadata: n.metadata ? JSON.parse(n.metadata) : null,
      })),
      nextCursor: hasMore ? result[result.length - 1].createdAt.toISOString() : null,
    };
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
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

  async deleteNotification(notificationId: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  async getPreferences(userId: string) {
    const types = [
      "collab_request",
      "match_found",
      "project_update",
      "review_received",
      "team_invite",
      "follow",
    ];
    const existing = await prisma.notificationPreference.findMany({ where: { userId } });
    return types.map((type) => ({
      type,
      email: existing.find((e) => e.type === type)?.email ?? true,
    }));
  }

  async upsertPreference(userId: string, type: string, email: boolean) {
    return prisma.notificationPreference.upsert({
      where: { userId_type: { userId, type } },
      create: { userId, type, email },
      update: { email },
    });
  }
}
