import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { toggleBookmark, getBookmarks } from "./bookmarks.controller";

const router = Router();

router.post("/:projectId", authenticate, toggleBookmark);
router.get("/", authenticate, getBookmarks);

export default router;
