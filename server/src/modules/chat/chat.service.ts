import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/errors";

export class ChatService {
  async getConversations(userId: string) {
    return prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getOrCreateConversation(userId: string, otherUserId: string) {
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });
    if (existing) return existing;

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });
    return conversation;
  }

  async getMessages(conversationId: string, userId: string) {
    const conv = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { userId } },
      },
    });
    if (!conv) throw new AppError(403, "Not a participant");

    return prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const conv = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { userId: senderId } },
      },
    });
    if (!conv) throw new AppError(403, "Not a participant");

    const message = await prisma.message.create({
      data: { conversationId, senderId, content },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }
}
