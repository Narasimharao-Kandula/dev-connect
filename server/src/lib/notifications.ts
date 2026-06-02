import { prisma } from "./prisma";
import { getIO } from "../socket";
import { sendNotificationEmail } from "./email";

export async function createNotification(
  userId: string,
  type: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  const [notification, user, pref] = await Promise.all([
    prisma.notification.create({
      data: {
        userId,
        type,
        message,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    }),
    prisma.notificationPreference.findUnique({
      where: { userId_type: { userId, type } },
    }),
  ]);

  if (user && (pref?.email ?? true)) {
    sendNotificationEmail(user.email, user.name, type, message).catch(() => {});
  }

  try {
    getIO().to(`user:${userId}`).emit("notification:new", {
      ...notification,
      metadata: metadata || null,
    });
  } catch {
    // Socket.IO not initialized yet
  }

  return notification;
}
