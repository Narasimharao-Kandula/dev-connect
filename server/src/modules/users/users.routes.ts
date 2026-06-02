import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateProfile,
  updateSkills,
  updateAvailability,
} from "./users.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.get("/", authenticate, getUsers);
router.get("/:id", authenticate, getUserById);
router.patch("/profile", authenticate, updateProfile);
router.patch("/skills", authenticate, updateSkills);
router.patch("/availability", authenticate, updateAvailability);

export default router;
