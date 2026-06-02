import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { adminOnly } from "../../middleware/admin";
import { getAdminStats, getAdminUsers, updateUserRole, deleteUser } from "./admin.controller";

const router = Router();

router.get("/stats", authenticate, adminOnly, getAdminStats);
router.get("/users", authenticate, adminOnly, getAdminUsers);
router.patch("/users/:userId/role", authenticate, adminOnly, updateUserRole);
router.delete("/users/:userId", authenticate, adminOnly, deleteUser);

export default router;
