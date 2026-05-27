import 'dotenv/config';

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '3000'), 10),
  CLIENT_URL: optional('CLIENT_URL', 'http://localhost:3001'),

  DATABASE_URL: required('DATABASE_URL'),
  REDIS_URL: optional('REDIS_URL', 'redis://localhost:6379'),

  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRY: optional('JWT_ACCESS_EXPIRY', '15m'),
  JWT_REFRESH_EXPIRY: optional('JWT_REFRESH_EXPIRY', '7d'),

  GOOGLE_CLIENT_ID: optional('GOOGLE_CLIENT_ID', ''),
  GOOGLE_CLIENT_SECRET: optional('GOOGLE_CLIENT_SECRET', ''),

  CLOUDINARY_CLOUD_NAME: optional('CLOUDINARY_CLOUD_NAME', ''),
  CLOUDINARY_API_KEY: optional('CLOUDINARY_API_KEY', ''),
  CLOUDINARY_API_SECRET: optional('CLOUDINARY_API_SECRET', ''),

  RAZORPAY_KEY_ID: optional('RAZORPAY_KEY_ID', ''),
  RAZORPAY_KEY_SECRET: optional('RAZORPAY_KEY_SECRET', ''),
  RAZORPAY_WEBHOOK_SECRET: optional('RAZORPAY_WEBHOOK_SECRET', ''),

  SMTP_HOST: optional('SMTP_HOST', 'smtp.resend.com'),
  SMTP_PORT: parseInt(optional('SMTP_PORT', '465'), 10),
  SMTP_USER: optional('SMTP_USER', 'resend'),
  SMTP_PASS: optional('SMTP_PASS', ''),
  EMAIL_FROM: optional('EMAIL_FROM', 'noreply@bookmyvenue.in'),
} as const;
