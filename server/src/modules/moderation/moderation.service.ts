import { prisma } from "../../lib/prisma";

export const blockUser = async (blockerId: string, blockedId: string) => {
  if (blockerId === blockedId) throw new Error("Cannot block yourself");
  await prisma.block.create({ data: { blockerId, blockedId } });
};

export const unblockUser = async (blockerId: string, blockedId: string) => {
  await prisma.block.delete({ where: { blockerId_blockedId: { blockerId, blockedId } } });
};

export const getBlockedUsers = async (blockerId: string) => {
  return prisma.block.findMany({
    where: { blockerId },
    include: { blocked: { select: { id: true, name: true, avatar: true } } },
  });
};

export const reportUser = async (reporterId: string, reportedId: string, reason: string) => {
  if (reporterId === reportedId) throw new Error("Cannot report yourself");
  return prisma.report.create({ data: { reporterId, reportedId, reason } });
};

export const getBlockedIds = async (userId: string) => {
  const blocks = await prisma.block.findMany({
    where: { blockerId: userId },
    select: { blockedId: true },
  });
  return blocks.map((b) => b.blockedId);
};
