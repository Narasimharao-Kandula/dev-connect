import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { createReview, getUserReviews, deleteReview } from "./reviews.controller";

const router = Router();

router.post("/", authenticate, createReview);
router.get("/user/:userId", getUserReviews);
router.delete("/:id", authenticate, deleteReview);

export default router;
