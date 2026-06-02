import { prisma } from "../../lib/prisma";

export class FollowService {
  async toggle(followerId: string, followedId: string) {
    if (followerId === followedId) throw new Error("Cannot follow yourself");

    const existing = await prisma.follow.findUnique({
      where: { followerId_followedId: { followerId, followedId } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { followerId_followedId: { followerId, followedId } } });
      return { following: false };
    }

    await prisma.follow.create({ data: { followerId, followedId } });
    return { following: true };
  }

  async getFollowing(userId: string) {
    return prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        followed: { select: { id: true, name: true, avatar: true, country: true, availability: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getFollowers(userId: string) {
    return prisma.follow.findMany({
      where: { followedId: userId },
      include: {
        follower: { select: { id: true, name: true, avatar: true, country: true, availability: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async isFollowing(followerId: string, followedId: string) {
    const existing = await prisma.follow.findUnique({
      where: { followerId_followedId: { followerId, followedId } },
    });
    return !!existing;
  }
}
