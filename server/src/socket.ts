import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

let io: Server;
const onlineUsers = new Set<string>();

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}

export function setupSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL.split(",").map(s => s.trim()), credentials: true },
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
    const wasOffline = !onlineUsers.has(userId);
    onlineUsers.add(userId);
    socket.join(`user:${userId}`);
    if (wasOffline) {
      io.emit("user:online", { userId });
    }

    socket.on("chat:join", (data: { conversationId: string }) => {
      socket.join(`conversation:${data.conversationId}`);
    });

    socket.on("chat:leave", (data: { conversationId: string }) => {
      socket.leave(`conversation:${data.conversationId}`);
    });

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

    socket.on("chat:typing", (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("chat:typing", {
        userId,
        conversationId: data.conversationId,
      });
    });

    socket.on("chat:stop-typing", (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("chat:stop-typing", {
        userId,
        conversationId: data.conversationId,
      });
    });

    socket.on("messages:read", async (data: { conversationId: string }) => {
      await prisma.message.updateMany({
        where: { conversationId: data.conversationId, senderId: { not: userId }, read: false },
        data: { read: true },
      });
      socket.to(`conversation:${data.conversationId}`).emit("messages:read", {
        conversationId: data.conversationId,
        userId,
      });
    });

    socket.on("team:join", (data: { teamId: string }) => {
      socket.join(`team:${data.teamId}`);
    });

    socket.on("team:leave", (data: { teamId: string }) => {
      socket.leave(`team:${data.teamId}`);
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
      onlineUsers.delete(userId);
      io.emit("user:offline", { userId });
    });
  });

  return io;
}
