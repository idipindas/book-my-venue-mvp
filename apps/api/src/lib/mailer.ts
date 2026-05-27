import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
});

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  await transporter.sendMail({ from: config.EMAIL_FROM, ...opts });
}

export function verificationEmailHtml(name: string, token: string): string {
  const link = `${config.CLIENT_URL}/auth/verify-email?token=${token}`;
  return `<p>Hi ${name},</p><p>Verify your email: <a href="${link}">${link}</a></p>`;
}

export function resetPasswordEmailHtml(name: string, token: string): string {
  const link = `${config.CLIENT_URL}/auth/reset-password?token=${token}`;
  return `<p>Hi ${name},</p><p>Reset your password: <a href="${link}">${link}</a></p><p>This link expires in 1 hour.</p>`;
}
