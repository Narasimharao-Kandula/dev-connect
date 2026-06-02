import { ReviewService } from "./reviews.service";

const service = new ReviewService();

export const createReview = async (req: any, res: any, next: any) => {
  try {
    const { reviewedId, rating, comment, projectId, communication, technicalSkill, reliability, teamwork } = req.body;
    const review = await service.create(req.user.userId, reviewedId, rating, comment, projectId, {
      communication, technicalSkill, reliability, teamwork,
    });
    res.status(201).json(review);
  } catch (err: any) {
    if (err.message?.includes("already reviewed") || err.message?.includes("Cannot review yourself") || err.message?.includes("No collaboration")) {
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  }
};

export const getUserReviews = async (req: any, res: any, next: any) => {
  try {
    const reviews = await service.getUserReviews(req.params.userId);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req: any, res: any, next: any) => {
  try {
    await service.delete(req.params.id, req.user.userId);
    res.json({ message: "Review deleted" });
  } catch (err: any) {
    if (err.message?.includes("not found")) {
      res.status(404).json({ error: err.message });
      return;
    }
    next(err);
  }
};
