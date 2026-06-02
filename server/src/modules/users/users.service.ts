import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/errors";

interface GetUsersParams {
  skill?: string;
  country?: string;
  experience?: string;
  remoteOnly?: string;
  openToCollab?: string;
  search?: string;
}

export class UserService {
  async getUsers(params: GetUsersParams) {
    const where: any = {};

    if (params.skill) {
      where.skills = {
        some: { skill: { name: { contains: params.skill, mode: "insensitive" } } },
      };
    }
    if (params.country) {
      where.country = { contains: params.country, mode: "insensitive" };
    }
    if (params.remoteOnly === "true") {
      where.profile = { remoteOnly: true };
    }
    if (params.openToCollab === "true") {
      where.profile = { ...where.profile, openToCollab: true };
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { skills: { some: { skill: { name: { contains: params.search, mode: "insensitive" } } } } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        timezone: true,
        avatar: true,
        availability: true,
        lastActive: true,
        profile: true,
        skills: { include: { skill: true } },
      },
      orderBy: { lastActive: "desc" },
    });

    return users;
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        timezone: true,
        avatar: true,
        availability: true,
        lastActive: true,
        responseRate: true,
        createdAt: true,
        profile: true,
        skills: { include: { skill: true } },
        ownedProjects: {
          select: { id: true, name: true, status: true },
          take: 10,
        },
      },
    });
    if (!user) throw new AppError(404, "User not found");
    return user;
  }

  async updateProfile(
    userId: string,
    data: {
      bio?: string;
      experience?: number;
      githubUrl?: string;
      portfolio?: string;
      remoteOnly?: boolean;
      openToCollab?: boolean;
      country?: string;
      timezone?: string;
      name?: string;
    }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        country: data.country,
        timezone: data.timezone,
        profile: data.bio !== undefined || data.experience !== undefined || data.githubUrl !== undefined || data.portfolio !== undefined || data.remoteOnly !== undefined || data.openToCollab !== undefined ? {
          upsert: {
            create: {
              bio: data.bio,
              experience: data.experience,
              githubUrl: data.githubUrl,
              portfolio: data.portfolio,
              remoteOnly: data.remoteOnly ?? false,
              openToCollab: data.openToCollab ?? true,
            },
            update: {
              bio: data.bio,
              experience: data.experience,
              githubUrl: data.githubUrl,
              portfolio: data.portfolio,
              remoteOnly: data.remoteOnly,
              openToCollab: data.openToCollab,
            },
          },
        } : undefined,
      },
      select: {
        id: true,
        name: true,
        country: true,
        timezone: true,
        profile: true,
      },
    });
    return user;
  }

  async updateSkills(userId: string, skillNames: string[]) {
    const skills = await Promise.all(
      skillNames.map((name) =>
        prisma.skill.upsert({
          where: { name: name.toLowerCase() },
          create: { name: name.toLowerCase() },
          update: {},
        })
      )
    );

    await prisma.userSkill.deleteMany({ where: { userId } });
    await prisma.userSkill.createMany({
      data: skills.map((s) => ({ userId, skillId: s.id })),
    });

    return prisma.user.findUnique({
      where: { id: userId },
      select: { skills: { include: { skill: true } } },
    });
  }

  async updateAvailability(userId: string, availability: string) {
    const valid = ["Available", "Busy", "LookingForTeam"];
    if (!valid.includes(availability)) {
      throw new AppError(400, "Invalid availability value");
    }
    return prisma.user.update({
      where: { id: userId },
      data: { availability: availability as any },
      select: { id: true, availability: true },
    });
  }
}
