import { Router } from "express";
import {
  register, login, me,
  forgotPassword, resetPassword,
  sendVerification, verifyEmail,
  completeOnboarding,
  deleteAccount, cancelDeletion, deletionStatus,
  changePassword, getAccounts,
} from "./auth.controller";
import { authenticate } from "../../middleware/auth";
import { loginLimiter, sendVerificationLimiter } from "../../middleware/rateLimit";
import oauthRoutes from "./oauth.routes";

const router = Router();

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.get("/me", authenticate, me);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/send-verification", authenticate, sendVerificationLimiter, sendVerification);
router.get("/verify-email/:token", verifyEmail);

router.post("/onboarding", authenticate, completeOnboarding);

router.post("/delete-account", authenticate, deleteAccount);
router.post("/cancel-deletion", authenticate, cancelDeletion);
router.get("/deletion-status", authenticate, deletionStatus);

router.post("/change-password", authenticate, changePassword);
router.get("/accounts", authenticate, getAccounts);

router.use(oauthRoutes);

export default router;
