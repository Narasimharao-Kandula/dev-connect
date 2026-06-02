import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { toggleFollow, getFollowing, getFollowers } from "./follow.controller";

const router = Router();

router.post("/:userId", authenticate, toggleFollow);
router.get("/following", authenticate, getFollowing);
router.get("/followers", authenticate, getFollowers);

export default router;
