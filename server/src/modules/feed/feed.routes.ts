import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { getFeed } from "./feed.controller";

const router = Router();

router.get("/", authenticate, getFeed);

export default router;
