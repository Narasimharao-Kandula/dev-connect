import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/errors";
import { createNotification } from "../../lib/notifications";

export class TeamService {
  async createTeam(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { team: true },
    });
    if (!project) throw new AppError(404, "Project not found");
    if (project.ownerId !== userId) throw new AppError(403, "Only project owner can create team");
    if (project.team) throw new AppError(409, "Team already exists for this project");

    const team = await prisma.team.create({
      data: {
        projectId,
        members: {
          create: { userId, role: "Owner" },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        project: { select: { id: true, name: true } },
      },
    });
    return team;
  }

  async addMember(teamId: string, userId: string, role: string, requesterId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { project: { select: { id: true, name: true, ownerId: true } } },
    });
    if (!team) throw new AppError(404, "Team not found");
    if (team.project.ownerId !== requesterId) throw new AppError(403, "Only project owner can add members");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found");

    const existing = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    if (existing) throw new AppError(409, "Member already in team");

    const member = await prisma.teamMember.create({
      data: { teamId, userId, role },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    await createNotification(userId, "TEAM_INVITE", `You have been added to team for project "${team.project.name}"`, { teamId, projectId: team.projectId });

    return member;
  }

  async removeMember(teamId: string, memberUserId: string, requesterId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { project: { select: { ownerId: true } } },
    });
    if (!team) throw new AppError(404, "Team not found");
    if (team.project.ownerId !== requesterId) throw new AppError(403, "Only project owner can remove members");

    await prisma.teamMember.deleteMany({
      where: { teamId, userId: memberUserId },
    });
    return { message: "Member removed" };
  }

  async getMessages(teamId: string, userId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: { where: { userId } } },
    });
    if (!team) throw new AppError(404, "Team not found");
    if (team.members.length === 0) throw new AppError(403, "Not a team member");

    return prisma.groupMessage.findMany({
      where: { teamId },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async sendMessage(teamId: string, senderId: string, content: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: { where: { userId: senderId } } },
    });
    if (!team) throw new AppError(404, "Team not found");
    if (team.members.length === 0) throw new AppError(403, "Not a team member");

    return prisma.groupMessage.create({
      data: { teamId, senderId, content },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
  }
}
