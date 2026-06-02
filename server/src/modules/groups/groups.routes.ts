import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { listGroups, getGroup, createGroup, joinGroup, leaveGroup, createPost, createComment } from "./groups.controller";

const router = Router();

router.get("/", authenticate, listGroups);
router.get("/:id", authenticate, getGroup);
router.post("/", authenticate, createGroup);
router.post("/:id/join", authenticate, joinGroup);
router.post("/:id/leave", authenticate, leaveGroup);
router.post("/:id/posts", authenticate, createPost);
router.post("/posts/:postId/comments", authenticate, createComment);

export default router;
