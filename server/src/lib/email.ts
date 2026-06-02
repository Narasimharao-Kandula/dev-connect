import nodemailer from "nodemailer";
import { env } from "../config/env";

function getTransporter() {
  if (!env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

const FROM = `"DevConnect" <${env.SMTP_FROM}>`;

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${env.CLIENT_URL}/reset-password/${token}`;

  if (!env.SMTP_PASS) {
    console.log(`\n📧 [DEV] Password reset email for ${email}:`);
    console.log(`  To: ${email}`);
    console.log(`  Subject: Reset your DevConnect password`);
    console.log(`  Reset link: ${resetUrl}\n`);
    return;
  }

  const transporter = getTransporter()!;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your DevConnect password",
    html: getResetHtml(name, resetUrl),
  });
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${env.CLIENT_URL}/verify-email/${token}`;

  if (!env.SMTP_PASS) {
    console.log(`\n📧 [DEV] Verification email for ${email}:`);
    console.log(`  To: ${email}`);
    console.log(`  Subject: Verify your DevConnect email`);
    console.log(`  Verify link: ${verifyUrl}\n`);
    return;
  }

  const transporter = getTransporter()!;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verify your DevConnect email",
    html: getVerifyHtml(name, verifyUrl),
  });
}

function getResetHtml(name: string, resetUrl: string) {
  return `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #6C4CF1, #8B5CF6); padding: 32px; text-align: center;">
        <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="4" cy="12" r="1.5"/><circle cx="20" cy="12" r="1.5"/><circle cx="12" cy="4" r="1.5"/><circle cx="12" cy="20" r="1.5"/></svg>
        </div>
        <h1 style="color: white; font-size: 20px; margin: 0; font-weight: 700;">DevConnect</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="font-size: 18px; color: #0F172A; margin: 0 0 8px;">Reset your password</h2>
        <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">Hi ${name}, we received a request to reset your password. Click the button below to choose a new one. This link expires in 24 hours.</p>
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6C4CF1, #8B5CF6); color: white; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-weight: 600; font-size: 14px;">Reset Password</a>
        <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
  `;
}

function getVerifyHtml(name: string, verifyUrl: string) {
  return `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #6C4CF1, #8B5CF6); padding: 32px; text-align: center;">
        <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h1 style="color: white; font-size: 20px; margin: 0; font-weight: 700;">DevConnect</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="font-size: 18px; color: #0F172A; margin: 0 0 8px;">Verify your email</h2>
        <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">Hi ${name}, welcome to DevConnect! Please verify your email address by clicking the button below.</p>
        <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #6C4CF1, #8B5CF6); color: white; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-weight: 600; font-size: 14px;">Verify Email</a>
        <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">This link expires in 24 hours.</p>
      </div>
    </div>
  `;
}
