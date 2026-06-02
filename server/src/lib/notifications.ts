import { prisma } from "./prisma";
import { getIO } from "../socket";

export async function createNotification(
  userId: string,
  type: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      message,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    },
  });

  try {
    getIO().to(`user:${userId}`).emit("notification:new", notification);
  } catch {
    // Socket.IO not initialized yet
  }

  return notification;
}
