import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { search, suggest } from "./search.controller";

const router = Router();

router.get("/", authenticate, search);
router.get("/suggest", authenticate, suggest);

export default router;
