import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/errors";
import { createNotification } from "../../lib/notifications";

export class RequestService {
  async send(senderId: string, receiverId: string, message?: string) {
    if (senderId === receiverId) throw new AppError(400, "Cannot send request to yourself");

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) throw new AppError(404, "User not found");

    const existing = await prisma.collaborationRequest.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } },
    });
    if (existing) {
      if (existing.status === "Pending") throw new AppError(409, "Request already sent");
      if (existing.status === "Accepted") throw new AppError(409, "Already connected");
      // Rejected — delete old so a new request can be created
      await prisma.collaborationRequest.delete({ where: { id: existing.id } });
    }

    const request = await prisma.collaborationRequest.create({
      data: { senderId, receiverId, message },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    await createNotification(receiverId, "REQUEST_RECEIVED", `You received a collaboration request from ${request.sender.name}`, { requestId: request.id });

    return request;
  }

  async respond(requestId: string, userId: string, status: "Accepted" | "Rejected") {
    const request = await prisma.collaborationRequest.findUnique({
      where: { id: requestId },
      include: { sender: { select: { name: true } } },
    });
    if (!request) throw new AppError(404, "Request not found");
    if (request.receiverId !== userId) throw new AppError(403, "Not authorized");
    if (request.status !== "Pending") throw new AppError(400, "Request already responded to");

    const updated = await prisma.collaborationRequest.update({
      where: { id: requestId },
      data: { status },
    });

    const notificationType = status === "Accepted" ? "REQUEST_ACCEPTED" : "REQUEST_REJECTED";
    const notificationMessage =
      status === "Accepted"
        ? `${request.sender.name} accepted your collaboration request`
        : `${request.sender.name} rejected your collaboration request`;

    await createNotification(request.senderId, notificationType, notificationMessage, { requestId: request.id });

    if (status === "Accepted") {
      const existingConv = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: request.senderId } } },
            { participants: { some: { userId: request.receiverId } } },
          ],
        },
      });
      if (!existingConv) {
        await prisma.conversation.create({
          data: {
            participants: {
              create: [{ userId: request.senderId }, { userId: request.receiverId }],
            },
          },
        });
      }
    }

    return updated;
  }

  async getReceived(userId: string) {
    return prisma.collaborationRequest.findMany({
      where: { receiverId: userId },
      include: {
        sender: { select: { id: true, name: true, avatar: true, country: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSent(userId: string) {
    return prisma.collaborationRequest.findMany({
      where: { senderId: userId },
      include: {
        receiver: { select: { id: true, name: true, avatar: true, country: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
