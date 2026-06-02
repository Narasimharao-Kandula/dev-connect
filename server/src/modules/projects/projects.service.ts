import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/errors";
import { MatchService } from "../match/match.service";

const matchService = new MatchService();

export class ProjectService {
  async create(ownerId: string, name: string, description: string | undefined, skillNames: string[]) {
    const skills = await Promise.all(
      skillNames.map((n) =>
        prisma.skill.upsert({
          where: { name: n.toLowerCase() },
          create: { name: n.toLowerCase() },
          update: {},
        })
      )
    );

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId,
        skills: {
          create: skills.map((s) => ({ skillId: s.id })),
        },
      },
      include: {
        skills: { include: { skill: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    // Fire-and-forget: notify matching developers
    matchService.notifyMatchingDevelopers(project.id, project.name, skillNames).catch(() => {});

    return project;
  }

  async findAll(userId: string) {
    return prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { team: { members: { some: { userId } } } },
        ],
      },
      include: {
        skills: { include: { skill: true } },
        owner: { select: { id: true, name: true } },
        team: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, avatar: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        skills: { include: { skill: true } },
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        team: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, avatar: true, email: true } } },
            },
          },
        },
      },
    });
    if (!project) throw new AppError(404, "Project not found");
    return project;
  }

  async update(id: string, userId: string, data: { name?: string; description?: string; status?: string; skillNames?: string[] }) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new AppError(404, "Project not found");
    if (project.ownerId !== userId) throw new AppError(403, "Not authorized");

    let skillsUpdate = {};
    if (data.skillNames) {
      const skills = await Promise.all(
        data.skillNames.map((n) =>
          prisma.skill.upsert({
            where: { name: n.toLowerCase() },
            create: { name: n.toLowerCase() },
            update: {},
          })
        )
      );
      await prisma.projectSkill.deleteMany({ where: { projectId: id } });
      skillsUpdate = {
        skills: { create: skills.map((s) => ({ skillId: s.id })) },
      };
    }

    return prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status as any,
        ...skillsUpdate,
      },
      include: {
        skills: { include: { skill: true } },
        owner: { select: { id: true, name: true } },
        team: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, avatar: true } } },
            },
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new AppError(404, "Project not found");
    if (project.ownerId !== userId) throw new AppError(403, "Not authorized");

    await prisma.project.delete({ where: { id } });
    return { message: "Project deleted" };
  }
}
