import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { getAllAchievements, getUserAchievements, checkAchievements } from "./achievements.controller";

const router = Router();

router.get("/", authenticate, getAllAchievements);
router.get("/mine", authenticate, getUserAchievements);
router.post("/check", authenticate, checkAchievements);

export default router;
