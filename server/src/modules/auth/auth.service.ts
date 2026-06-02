import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { AppError } from "../../lib/errors";
import { addDays } from "../../lib/dates";
import { sendPasswordResetEmail, sendVerificationEmail } from "../../lib/email";

export class AuthService {
  async register(email: string, password: string, name: string) {
    if (!name || name.trim().length < 2) {
      throw new AppError(400, "Name must be at least 2 characters long");
    }
    if (!email || !email.includes("@")) {
      throw new AppError(400, "Please enter a valid email address");
    }
    if (!password || password.length < 6) {
      throw new AppError(400, "Password must be at least 6 characters long");
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.deletedAt) {
        const deletedDate = new Date(existing.deletedAt).toLocaleDateString();
        throw new AppError(409, `This account was previously deleted and is scheduled for permanent removal on ${deletedDate}. Please use a different email address.`);
      }
      throw new AppError(409, "An account with this email already exists. Try signing in instead.");
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const token = this.generateToken(user.id, user.email, user.role);
    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, "No account found with this email address");

    if (!user.password) {
      const accounts = await prisma.account.findMany({ where: { userId: user.id } });
      const providers = accounts.map((a) => a.provider).join(" or ");
      throw new AppError(401, `This account uses ${providers} login. Please sign in with ${providers}.`);
    }

    if (user.deletedAt) {
      const daysLeft = Math.ceil(
        (user.deletedAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysLeft > 0) {
        throw new AppError(
          403,
          `This account is scheduled for deletion. ${daysLeft} days remaining until permanent removal. You can contact support to cancel deletion.`
        );
      }
      throw new AppError(403, "This account has been permanently deleted");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, "Incorrect password. Please try again");

    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    const token = this.generateToken(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted,
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        country: true,
        timezone: true,
        avatar: true,
        availability: true,
        role: true,
        emailVerified: true,
        onboardingCompleted: true,
        lastActive: true,
        deletedAt: true,
        profile: true,
        skills: { include: { skill: true } },
      },
    });
    if (!user) throw new AppError(404, "User not found");
    return user;
  }

  // ─── Forgot / Reset Password ───────────────────────────

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { message: "If that email exists, a reset link has been sent", resetToken: undefined };

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = addDays(1);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires },
    });

    // Send email
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    return { message: "If that email exists, a reset link has been sent", resetToken };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gte: new Date() },
      },
    });
    if (!user) throw new AppError(400, "Invalid or expired reset token");

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { message: "Password reset successfully" };
  }

  // ─── Email Verification ─────────────────────────────────

  async sendVerification(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found");
    if (user.emailVerified) throw new AppError(400, "Email already verified");

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = addDays(7);
    await prisma.user.update({
      where: { id: userId },
      data: { verificationToken, verificationTokenExpires },
    });

    // Send email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    return { message: "Verification email sent", verificationToken };
  }

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: { gte: new Date() },
      },
    });
    if (!user) throw new AppError(400, "Invalid or expired verification token");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    return { message: "Email verified successfully" };
  }

  // ─── Onboarding ──────────────────────────────────────────

  async completeOnboarding(
    userId: string,
    data: {
      bio?: string;
      experience?: number;
      country?: string;
      timezone?: string;
      githubUrl?: string;
      portfolio?: string;
      remoteOnly?: boolean;
      openToCollab?: boolean;
      availability?: string;
      skills?: string[];
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found");
    if (user.onboardingCompleted) throw new AppError(400, "Onboarding already completed");

    const updateData: any = {
      onboardingCompleted: true,
      country: data.country,
      timezone: data.timezone,
      availability: data.availability || user.availability,
    };

    if (data.bio !== undefined || data.experience !== undefined ||
        data.githubUrl !== undefined || data.portfolio !== undefined ||
        data.remoteOnly !== undefined || data.openToCollab !== undefined) {
      updateData.profile = {
        upsert: {
          create: {
            bio: data.bio,
            experience: data.experience,
            githubUrl: data.githubUrl,
            portfolio: data.portfolio,
            remoteOnly: data.remoteOnly ?? false,
            openToCollab: data.openToCollab ?? true,
          },
          update: {
            bio: data.bio,
            experience: data.experience,
            githubUrl: data.githubUrl,
            portfolio: data.portfolio,
            remoteOnly: data.remoteOnly,
            openToCollab: data.openToCollab,
          },
        },
      };
    }

    if (data.skills && data.skills.length > 0) {
      const skills = await Promise.all(
        data.skills.map((name) =>
          prisma.skill.upsert({
            where: { name: name.toLowerCase() },
            create: { name: name.toLowerCase() },
            update: {},
          })
        )
      );
      await prisma.userSkill.deleteMany({ where: { userId } });
      await prisma.userSkill.createMany({
        data: skills.map((s) => ({ userId, skillId: s.id })),
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.getMe(userId);
  }

  // ─── Account Deletion ────────────────────────────────────

  async deleteAccount(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found");
    if (user.deletedAt) throw new AppError(400, "Account already scheduled for deletion");

    const deleteAt = addDays(30);
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: deleteAt },
    });

    return {
      message: `Account scheduled for deletion. You have 30 days to cancel. Permanent deletion on ${deleteAt.toLocaleDateString()}.`,
      scheduledDate: deleteAt,
    };
  }

  async cancelDeletion(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found");
    if (!user.deletedAt) throw new AppError(400, "Account is not scheduled for deletion");

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: null },
    });

    return { message: "Account deletion cancelled. Welcome back!" };
  }

  async getDeletionStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { deletedAt: true },
    });
    if (!user) throw new AppError(404, "User not found");

    if (!user.deletedAt) {
      return { scheduled: false, message: "Account is active" };
    }

    const daysLeft = Math.ceil(
      (user.deletedAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return {
      scheduled: true,
      permanentDeletionDate: user.deletedAt,
      daysLeft: Math.max(0, daysLeft),
      canCancel: daysLeft > 0,
    };
  }

  private generateToken(userId: string, email: string, role: string = "User"): string {
    const expiresIn = env.JWT_EXPIRES_IN ? parseInt(env.JWT_EXPIRES_IN) : 7 * 24 * 60 * 60;
    return jwt.sign({ userId, email, role }, env.JWT_SECRET, {
      expiresIn: isNaN(expiresIn) ? 7 * 24 * 60 * 60 : expiresIn,
    });
  }

  // ─── Password Change ─────────────────────────────────────

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found");
    if (!user.password) throw new AppError(400, "OAuth accounts cannot change password directly");

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new AppError(400, "Current password is incorrect");

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
  }

  // ─── OAuth Accounts ──────────────────────────────────────

  async getAccounts(userId: string) {
    return prisma.account.findMany({
      where: { userId },
      select: { provider: true, createdAt: true },
    });
  }
}
