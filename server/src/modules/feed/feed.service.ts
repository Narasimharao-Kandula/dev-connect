import { prisma } from "../../lib/prisma";
import { MatchService } from "../match/match.service";

const matchService = new MatchService();

export class FeedService {
  async getFeed(userId?: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [newUsers, newProjects, acceptedRequests, newReviews] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null },
        select: { id: true, name: true, avatar: true, createdAt: true, collaborationScore: true },
        orderBy: [{ collaborationScore: "desc" }, { createdAt: "desc" }],
        take: 10,
      }),
      prisma.project.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        include: {
          owner: { select: { id: true, name: true, avatar: true } },
          skills: { include: { skill: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.collaborationRequest.findMany({
        where: { updatedAt: { gte: sevenDaysAgo }, status: "Accepted" },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      prisma.review.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        include: {
          reviewer: { select: { id: true, name: true, avatar: true } },
          reviewed: { select: { id: true, name: true, avatar: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const feed: any[] = [];

    // Recommended projects for user (if logged in)
    if (userId) {
      try {
        const matchedProjects = await matchService.findMatchingProjects(userId, 5);
        matchedProjects.forEach((mp) => {
          feed.push({
            type: "recommended_project",
            project: mp.project,
            matchScore: mp.matchScore,
            matchedSkills: mp.matchedSkills,
            createdAt: mp.project.createdAt,
          });
        });
      } catch {}
    }

    // Top developers by collaboration score
    const topDevs = await prisma.user.findMany({
      where: { deletedAt: null, collaborationScore: { gt: 0 } },
      select: { id: true, name: true, avatar: true, collaborationScore: true, responseRate: true },
      orderBy: { collaborationScore: "desc" },
      take: 5,
    });
    topDevs.forEach((d) => feed.push({ type: "top_collaborator", user: d, createdAt: new Date() }));

    newUsers.forEach((u) => feed.push({ type: "new_user", user: u, createdAt: u.createdAt }));
    newProjects.forEach((p) => feed.push({ type: "new_project", project: p, createdAt: p.createdAt }));
    acceptedRequests.forEach((r) => feed.push({ type: "collaboration_accepted", sender: r.sender, receiver: r.receiver, createdAt: r.updatedAt }));
    newReviews.forEach((r) => feed.push({ type: "new_review", review: r, createdAt: r.createdAt }));

    feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return feed;
  }
}
