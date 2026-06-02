import { prisma } from "../../lib/prisma";
import { createNotification } from "../../lib/notifications";

interface SkillMatch {
  userId: string;
  name: string;
  avatar: string | null;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export class MatchService {
  calculateScore(requiredSkills: string[], userSkills: string[]): { score: number; matched: string[]; missing: string[] } {
    if (requiredSkills.length === 0) return { score: 0, matched: [], missing: [] };
    const required = requiredSkills.map((s) => s.toLowerCase());
    const user = userSkills.map((s) => s.toLowerCase());
    const matched = required.filter((s) => user.includes(s));
    const missing = required.filter((s) => !user.includes(s));
    const score = Math.round((matched.length / required.length) * 100);
    return { score, matched, missing };
  }

  async findMatchingDevelopers(projectId: string): Promise<SkillMatch[]> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { skills: { include: { skill: true } } },
    });
    if (!project) return [];

    const requiredSkills = project.skills.map((ps) => ps.skill.name);

    const developers = await prisma.user.findMany({
      where: {
        deletedAt: null,
        id: { not: project.ownerId },
        skills: { some: { skill: { name: { in: requiredSkills } } } },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        skills: { include: { skill: true } },
        collaborationScore: true,
        responseRate: true,
        lastActive: true,
      },
    });

    const results: SkillMatch[] = developers.map((dev) => {
      const devSkills = dev.skills.map((us) => us.skill.name);
      const { score, matched, missing } = this.calculateScore(requiredSkills, devSkills);
      return {
        userId: dev.id,
        name: dev.name,
        avatar: dev.avatar,
        matchScore: score,
        matchedSkills: matched,
        missingSkills: missing,
      };
    });

    results.sort((a, b) => b.matchScore - a.matchScore);
    return results;
  }

  async findMatchingProjects(userId: string, limit = 10) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: { include: { skill: true } } },
    });
    if (!user) return [];

    const userSkillNames = user.skills.map((us) => us.skill.name);

    const projects = await prisma.project.findMany({
      where: {
        ownerId: { not: userId },
        status: { not: "Archived" },
        skills: { some: { skill: { name: { in: userSkillNames } } } },
      },
      include: {
        skills: { include: { skill: true } },
        owner: { select: { id: true, name: true, avatar: true } },
      },
      take: 50,
    });

    const results = projects.map((p) => {
      const projectSkills = p.skills.map((ps) => ps.skill.name);
      const { score, matched, missing } = this.calculateScore(projectSkills, userSkillNames);
      return {
        project: p,
        matchScore: score,
        matchedSkills: matched,
        missingSkills: missing,
      };
    });

    results.sort((a, b) => b.matchScore - a.matchScore);
    return results.slice(0, limit);
  }

  async notifyMatchingDevelopers(projectId: string, projectName: string, requiredSkills: string[]) {
    const matches = await this.findMatchingDevelopers(projectId);
    const topMatches = matches.filter((m) => m.matchScore >= 50).slice(0, 10);

    for (const match of topMatches) {
      await createNotification(
        match.userId,
        "project_match",
        `New Opportunity: ${projectName} — ${match.matchScore}% skill match`,
        {
          projectId,
          projectName,
          matchScore: match.matchScore,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          type: "project_match",
        }
      );
    }

    return topMatches;
  }

  async recommendSkills(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: { include: { skill: true } } },
    });
    if (!user) return [];

    const userSkillNames = user.skills.map((us) => us.skill.name);

    const relatedProjects = await prisma.project.findMany({
      where: {
        skills: {
          some: { skill: { name: { in: userSkillNames } } },
        },
      },
      include: { skills: { include: { skill: true } } },
      take: 30,
    });

    const skillFrequency = new Map<string, number>();
    for (const p of relatedProjects) {
      for (const ps of p.skills) {
        const name = ps.skill.name;
        if (!userSkillNames.includes(name)) {
          skillFrequency.set(name, (skillFrequency.get(name) || 0) + 1);
        }
      }
    }

    return [...skillFrequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, frequency: count }));
  }

  async recommendTeam(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { skills: { include: { skill: true } } },
    });
    if (!project) return [];

    const requiredSkills = project.skills.map((ps) => ps.skill.name);

    const allDevs = await prisma.user.findMany({
      where: {
        deletedAt: null,
        id: { not: project.ownerId },
        skills: { some: {} },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        skills: { include: { skill: true } },
        collaborationScore: true,
        responseRate: true,
      },
    });

    const devsWithScore = allDevs.map((dev) => {
      const devSkills = dev.skills.map((us) => us.skill.name);
      const { score, matched } = this.calculateScore(requiredSkills, devSkills);
      return {
        userId: dev.id,
        name: dev.name,
        avatar: dev.avatar,
        matchScore: score,
        matchedSkills: matched,
        collaborationScore: dev.collaborationScore,
        responseRate: dev.responseRate,
        skillCoverage: matched.length,
      };
    });

    const covered = new Set<string>();
    const team: typeof devsWithScore = [];
    const sorted = devsWithScore.sort((a, b) => {
      const scoreDiff = b.matchScore - a.matchScore;
      if (scoreDiff !== 0) return scoreDiff;
      return b.collaborationScore - a.collaborationScore;
    });

    for (const dev of sorted) {
      const newSkills = dev.matchedSkills.filter((s) => !covered.has(s));
      if (newSkills.length > 0 || team.length < 2) {
        team.push(dev);
        dev.matchedSkills.forEach((s) => covered.add(s));
      }
      if (covered.size >= requiredSkills.length && team.length >= 3) break;
    }

    return {
      requiredSkills,
      coveredSkills: [...covered],
      missingSkills: requiredSkills.filter((s) => !covered.has(s)),
      recommendedTeam: team.slice(0, 5),
    };
  }
}
