import { prisma } from "../../lib/prisma";

export class ReviewService {
  async create(
    reviewerId: string,
    reviewedId: string,
    rating: number,
    comment?: string,
    projectId?: string,
    categories?: { communication?: number; technicalSkill?: number; reliability?: number; teamwork?: number }
  ) {
    if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
    if (reviewerId === reviewedId) throw new Error("Cannot review yourself");

    const existing = await prisma.review.findUnique({
      where: { reviewerId_reviewedId: { reviewerId, reviewedId } },
    });
    if (existing) throw new Error("You already reviewed this user");

    const collab = await prisma.collaborationRequest.findFirst({
      where: {
        status: "Accepted",
        OR: [
          { senderId: reviewerId, receiverId: reviewedId },
          { senderId: reviewedId, receiverId: reviewerId },
        ],
      },
    });
    if (!collab) throw new Error("No collaboration history with this user");

    const review = await prisma.review.create({
      data: {
        reviewerId,
        reviewedId,
        rating,
        comment,
        projectId,
        communication: categories?.communication,
        technicalSkill: categories?.technicalSkill,
        reliability: categories?.reliability,
        teamwork: categories?.teamwork,
      },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
      },
    });

    await this.updateCollaborationScore(reviewedId);

    return review;
  }

  async getUserReviews(userId: string) {
    const reviews = await prisma.review.findMany({
      where: { reviewedId: userId },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const [avgRating, avgComm, avgTech, avgRel, avgTeam] = await Promise.all([
      prisma.review.aggregate({ where: { reviewedId: userId }, _avg: { rating: true }, _count: { rating: true } }),
      prisma.review.aggregate({ where: { reviewedId: userId, communication: { not: null } }, _avg: { communication: true }, _count: true }),
      prisma.review.aggregate({ where: { reviewedId: userId, technicalSkill: { not: null } }, _avg: { technicalSkill: true }, _count: true }),
      prisma.review.aggregate({ where: { reviewedId: userId, reliability: { not: null } }, _avg: { reliability: true }, _count: true }),
      prisma.review.aggregate({ where: { reviewedId: userId, teamwork: { not: null } }, _avg: { teamwork: true }, _count: true }),
    ]);

    return {
      reviews,
      averageRating: avgRating._avg.rating ?? 0,
      totalReviews: avgRating._count.rating,
      categoryAverages: {
        communication: avgComm._avg.communication ?? null,
        technicalSkill: avgTech._avg.technicalSkill ?? null,
        reliability: avgRel._avg.reliability ?? null,
        teamwork: avgTeam._avg.teamwork ?? null,
      },
    };
  }

  async updateCollaborationScore(userId: string) {
    const agg = await prisma.review.aggregate({
      where: { reviewedId: userId },
      _avg: { rating: true, communication: true, technicalSkill: true, reliability: true, teamwork: true },
      _count: true,
    });

    const ratings = [agg._avg.rating, agg._avg.communication, agg._avg.technicalSkill, agg._avg.reliability, agg._avg.teamwork];
    const valid = ratings.filter((r): r is number => r !== null);
    const avg = valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
    const normalized = Math.round((avg / 5) * 100) / 100;

    await prisma.user.update({
      where: { id: userId },
      data: { collaborationScore: normalized },
    });
  }

  async delete(reviewId: string, userId: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new Error("Review not found");
    if (review.reviewerId !== userId) throw new Error("Not your review");
    await prisma.review.delete({ where: { id: reviewId } });
    await this.updateCollaborationScore(review.reviewedId);
  }
}
