import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { AppError } from "../../lib/errors";

export class OAuthService {
  async findOrCreateUser(provider: string, profile: { id: string; email: string; name: string; avatar?: string }) {
    const existing = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId: profile.id } },
      include: { user: true },
    });

    if (existing) {
      const token = this.generateToken(existing.user.id, existing.user.email, existing.user.role);
      return { user: existing.user, token, isNew: false };
    }

    const emailUser = await prisma.user.findUnique({ where: { email: profile.email } });

    if (emailUser) {
      await prisma.account.create({
        data: {
          userId: emailUser.id,
          provider,
          providerAccountId: profile.id,
        },
      });
      const token = this.generateToken(emailUser.id, emailUser.email, emailUser.role);
      return { user: emailUser, token, isNew: false };
    }

    const user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        password: null,
        avatar: profile.avatar,
        emailVerified: true,
        onboardingCompleted: false,
      },
    });

    await prisma.account.create({
      data: {
        userId: user.id,
        provider,
        providerAccountId: profile.id,
      },
    });

    const token = this.generateToken(user.id, user.email, user.role);
    return { user, token, isNew: true };
  }

  private generateToken(userId: string, email: string, role: string = "User"): string {
    return jwt.sign({ userId, email, role }, env.JWT_SECRET, {
      expiresIn: 7 * 24 * 60 * 60,
    });
  }
}
