import { prisma } from "../../lib/prisma";

export class GroupsService {
  async list(userId: string) {
    return prisma.group.findMany({
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, avatar: true } } }, take: 5 },
        _count: { select: { members: true, posts: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: string, userId: string) {
    return prisma.group.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        posts: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            comments: {
              orderBy: { createdAt: "asc" },
              include: { user: { select: { id: true, name: true, avatar: true } } },
            },
          },
        },
        _count: { select: { members: true } },
      },
    });
  }

  async create(data: { name: string; description?: string }, userId: string) {
    return prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: userId,
        members: { create: { userId, role: "admin" } },
      },
    });
  }

  async join(groupId: string, userId: string) {
    const existing = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
    if (existing) throw new Error("Already a member");
    return prisma.groupMember.create({ data: { groupId, userId } });
  }

  async leave(groupId: string, userId: string) {
    const member = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
    if (!member) throw new Error("Not a member");
    if (member.role === "admin") throw new Error("Admins cannot leave; transfer ownership first");
    return prisma.groupMember.delete({ where: { id: member.id } });
  }

  async createPost(groupId: string, userId: string, content: string) {
    const member = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
    if (!member) throw new Error("You must be a member to post");
    return prisma.groupPost.create({ data: { groupId, userId, content } });
  }

  async createComment(postId: string, userId: string, content: string) {
    return prisma.groupPostComment.create({ data: { postId, userId, content } });
  }
}
