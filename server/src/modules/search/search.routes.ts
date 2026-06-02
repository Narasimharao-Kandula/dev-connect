import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { searchLimiter } from "../../middleware/rateLimit";
import { search, suggest } from "./search.controller";

const router = Router();

router.get("/", authenticate, searchLimiter, search);
router.get("/suggest", authenticate, searchLimiter, suggest);

export default router;
