import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  getMatchingDevelopers,
  getMatchingProjects,
  getRecommendedSkills,
  getTeamRecommendation,
} from "./match.controller";

const router = Router();

router.get("/projects/:projectId/developers", authenticate, getMatchingDevelopers);
router.get("/projects/matching", authenticate, getMatchingProjects);
router.get("/skills/recommended", authenticate, getRecommendedSkills);
router.get("/projects/:projectId/team-recommendation", authenticate, getTeamRecommendation);

export default router;
