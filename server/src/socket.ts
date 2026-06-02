import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

let io: Server;

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export function setupSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId;
    socket.join(`user:${userId}`);

    socket.on("chat:send", async (data: { conversationId: string; content: string; attachmentUrl?: string }) => {
      try {
        const message = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            senderId: userId,
            content: data.content,
            attachmentUrl: data.attachmentUrl || null,
          },
          include: { sender: { select: { id: true, name: true, avatar: true } } },
        });

        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: { updatedAt: new Date() },
        });

        const conv = await prisma.conversation.findUnique({
          where: { id: data.conversationId },
          include: { participants: { select: { userId: true } } },
        });

        if (conv) {
          conv.participants.forEach((p) => {
            io.to(`user:${p.userId}`).emit("chat:receive", message);
          });
        }
      } catch (err) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("chat:typing", (data: { conversationId: string; userId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("chat:typing", {
        userId: data.userId,
        conversationId: data.conversationId,
      });
    });

    socket.on("team:send", async (data: { teamId: string; content: string }) => {
      try {
        const member = await prisma.teamMember.findUnique({
          where: { teamId_userId: { teamId: data.teamId, userId } },
        });
        if (!member) {
          socket.emit("error", { message: "Not a team member" });
          return;
        }

        const message = await prisma.groupMessage.create({
          data: {
            teamId: data.teamId,
            senderId: userId,
            content: data.content,
          },
          include: { sender: { select: { id: true, name: true, avatar: true } } },
        });

        io.to(`team:${data.teamId}`).emit("team:receive", message);
      } catch (err) {
        socket.emit("error", { message: "Failed to send team message" });
      }
    });

    socket.on("notification:read", async (data: { notificationId: string }) => {
      await prisma.notification.updateMany({
        where: { id: data.notificationId, userId },
        data: { read: true },
      });
      io.to(`user:${userId}`).emit("notification:updated", {
        id: data.notificationId,
        read: true,
      });
    });

    socket.on("disconnect", () => {
      socket.leave(`user:${userId}`);
    });
  });

  return io;
}
