import { Router } from "express";
import {
  sendRequest,
  respondToRequest,
  getReceivedRequests,
  getSentRequests,
} from "./requests.controller";
import { authenticate } from "../../middleware/auth";
import { requestRateLimiter } from "../../middleware/rateLimit";

const router = Router();

router.post("/", authenticate, requestRateLimiter, sendRequest);
router.patch("/:id", authenticate, respondToRequest);
router.get("/received", authenticate, getReceivedRequests);
router.get("/sent", authenticate, getSentRequests);

export default router;
