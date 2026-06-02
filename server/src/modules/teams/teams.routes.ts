import { Router } from "express";
import {
  createTeam,
  addMember,
  removeMember,
  getTeamMessages,
  sendTeamMessage,
} from "./teams.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.post("/projects/:projectId/team", authenticate, createTeam);
router.post("/teams/:id/members", authenticate, addMember);
router.delete("/teams/:id/members/:userId", authenticate, removeMember);
router.get("/teams/:id/messages", authenticate, getTeamMessages);
router.post("/teams/:id/messages", authenticate, sendTeamMessage);

export default router;
