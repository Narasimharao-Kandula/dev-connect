import { prisma } from "../../lib/prisma";

const ACHIEVEMENTS = [
  { key: "first_project", name: "First Project", description: "Create your first project", icon: "🚀", criteria: "project_count >= 1" },
  { key: "five_projects", name: "Project Creator", description: "Create 5 projects", icon: "📦", criteria: "project_count >= 5" },
  { key: "first_collab", name: "First Collaboration", description: "Complete your first collaboration", icon: "🤝", criteria: "collab_count >= 1" },
  { key: "ten_collabs", name: "Team Player", description: "Complete 10 collaborations", icon: "👥", criteria: "collab_count >= 10" },
  { key: "first_review", name: "First Review", description: "Receive your first review", icon: "⭐", criteria: "review_count >= 1" },
  { key: "top_collab_score", name: "Top Collaborator", description: "Achieve a collaboration score of 0.9 or higher", icon: "🏆", criteria: "collab_score >= 0.9" },
  { key: "skill_master", name: "Skill Master", description: "Add 10 or more skills to your profile", icon: "🎯", criteria: "skill_count >= 10" },
  { key: "social_butterfly", name: "Social Butterfly", description: "Follow 10 or more developers", icon: "🦋", criteria: "following_count >= 10" },
];

export class AchievementsService {
  async ensureAchievements() {
    for (const a of ACHIEVEMENTS) {
      await prisma.achievement.upsert({
        where: { key: a.key },
        update: { name: a.name, description: a.description, icon: a.icon, criteria: a.criteria },
        create: a,
      });
    }
  }

  async getAll() {
    await this.ensureAchievements();
    return prisma.achievement.findMany({ orderBy: { createdAt: "asc" } });
  }

  async getUserAchievements(userId: string) {
    return prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    });
  }

  async checkAndAward(userId: string) {
    await this.ensureAchievements();
    const achievements = await prisma.achievement.findMany();
    const existing = await prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } });
    const earnedIds = new Set(existing.map((e) => e.achievementId));

    const [projectCount, collabCount, reviewCount, user, skillCount, followingCount] = await Promise.all([
      prisma.project.count({ where: { ownerId: userId, deletedAt: null } }),
      prisma.collaborationRequest.count({ where: { receiverId: userId, status: "accepted" } }),
      prisma.review.count({ where: { reviewedId: userId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { collaborationScore: true } }),
      prisma.userSkill.count({ where: { userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    const newlyAwarded: string[] = [];

    for (const ach of achievements) {
      if (earnedIds.has(ach.id)) continue;
      let earned = false;
      switch (ach.key) {
        case "first_project": earned = projectCount >= 1; break;
        case "five_projects": earned = projectCount >= 5; break;
        case "first_collab": earned = collabCount >= 1; break;
        case "ten_collabs": earned = collabCount >= 10; break;
        case "first_review": earned = reviewCount >= 1; break;
        case "top_collab_score": earned = (user?.collaborationScore ?? 0) >= 0.9; break;
        case "skill_master": earned = skillCount >= 10; break;
        case "social_butterfly": earned = followingCount >= 10; break;
      }
      if (earned) {
        await prisma.userAchievement.create({ data: { userId, achievementId: ach.id } });
        newlyAwarded.push(ach.key);
      }
    }

    return newlyAwarded;
  }
}
