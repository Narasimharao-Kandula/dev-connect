import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/errors";

export class TaskService {
  async getByProject(projectId: string) {
    return prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  private async canModify(projectId: string, userId: string): Promise<boolean> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });
    if (!project) return false;
    if (project.ownerId === userId) return true;

    const member = await prisma.teamMember.findFirst({
      where: { team: { projectId }, userId },
    });
    return !!member;
  }

  async create(projectId: string, userId: string, title: string, description?: string, assigneeId?: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError(404, "Project not found");

    const authorized = await this.canModify(projectId, userId);
    if (!authorized) throw new AppError(403, "Not authorized to create tasks on this project");

    return prisma.task.create({
      data: { projectId, title, description, assigneeId: assigneeId || null, createdById: userId },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async update(taskId: string, userId: string, data: { title?: string; description?: string; status?: string; assigneeId?: string | null }) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { ownerId: true } } },
    });
    if (!task) throw new AppError(404, "Task not found");

    const authorized = await this.canModify(task.projectId, userId);
    if (!authorized) throw new AppError(403, "Not authorized to update this task");

    const validStatuses = ["Todo", "InProgress", "Done"];
    const status = data.status;
    if (status !== undefined && !validStatuses.includes(status)) {
      throw new AppError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(status !== undefined && { status: status as any }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async delete(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { ownerId: true } } },
    });
    if (!task) throw new AppError(404, "Task not found");

    const authorized = await this.canModify(task.projectId, userId);
    if (!authorized) throw new AppError(403, "Not authorized to delete this task");

    await prisma.task.delete({ where: { id: taskId } });
  }
}
