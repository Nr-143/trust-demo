import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';

const DEFAULT_TTL_MINUTES = 10;
const DEFAULT_LENGTH = 6;
const MAX_TTL_MINUTES = 60;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function base64Url(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function hashCode(secret, adminId, code) {
  return createHmac('sha256', secret).update(`${adminId}:${code}`).digest('hex');
}

export function getOtpConfig() {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = process.env.SMTP_PASS || '';
  const secret = process.env.OTP_SECRET || process.env.SMTP_PASS || '';

  if (!host) return null;

  const port = Number(process.env.SMTP_PORT) || (process.env.SMTP_SECURE === 'true' ? 465 : 587);
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === 'true'
      : port === 465;

  return {
    host,
    port,
    secure,
    user: user || undefined,
    pass: pass || undefined,
    from: process.env.SMTP_FROM || user || `no-reply@${host}`,
    fromName: process.env.SMTP_FROM_NAME || 'MMG Trust',
    secret,
    recipient: (process.env.OTP_RECIPIENT_EMAIL || '').trim(),
    ttlMinutes: clamp(
      Number(process.env.OTP_EXPIRY_MINUTES) || DEFAULT_TTL_MINUTES,
      1,
      MAX_TTL_MINUTES
    ),
    length: clamp(Number(process.env.OTP_LENGTH) || DEFAULT_LENGTH, 6, 10),
    subject: process.env.OTP_EMAIL_SUBJECT || 'Your admin password verification code',
  };
}

export function createChallenge(config, user) {
  const code = String(randomInt(0, 10 ** config.length)).padStart(config.length, '0');
  const expiresAt = Date.now() + config.ttlMinutes * 60 * 1000;
  const payload = base64Url(
    JSON.stringify({
      sub: user.id,
      h: hashCode(config.secret, user.id, code),
      exp: expiresAt,
    })
  );
  const signature = createHmac('sha256', config.secret).update(payload).digest('base64url');

  return {
    code,
    challenge: `${payload}.${signature}`,
    expiresAt,
  };
}

export function verifyChallenge(config, challenge, otp, adminId) {
  if (typeof challenge !== 'string' || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(challenge)) {
    throw Object.assign(new Error('The verification request is invalid. Please request a new code.'), {
      status: 400,
    });
  }

  const [payload, signature] = challenge.split('.');
  const expected = createHmac('sha256', config.secret).update(payload).digest('base64url');
  if (!safeEqual(signature, expected)) {
    throw Object.assign(new Error('The verification request is invalid. Please request a new code.'), {
      status: 400,
    });
  }

  let decoded;
  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    throw Object.assign(new Error('The verification request is invalid. Please request a new code.'), {
      status: 400,
    });
  }

  if (decoded?.sub !== adminId) {
    throw Object.assign(new Error('The verification request is invalid. Please request a new code.'), {
      status: 400,
    });
  }

  if (!decoded?.exp || Date.now() > Number(decoded.exp)) {
    throw Object.assign(new Error('The verification code has expired. Please request a new code.'), {
      status: 400,
    });
  }

  const code = (otp || '').trim();
  if (!/^\d+$/.test(code) || code.length !== config.length) {
    throw Object.assign(new Error('The verification code is invalid or has expired.'), { status: 400 });
  }

  const provided = hashCode(config.secret, adminId, code);
  if (!safeEqual(decoded.h, provided)) {
    throw Object.assign(new Error('The verification code is invalid or has expired.'), { status: 400 });
  }

  return true;
}

export async function sendOtpEmail(config, { to, code, adminEmail, expiresAt }) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user ? { user: config.user, pass: config.pass } : undefined,
  });

  const minutes = Math.max(1, Math.round((expiresAt - Date.now()) / 60000));
  const account = adminEmail || 'the admin account';

  try {
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.from}>`,
      to,
      subject: config.subject,
      text: [
        'Admin password verification',
        '',
        `Your one-time password is: ${code}`,
        '',
        `This code expires in ${minutes} minute(s) and can only be used once.`,
        `It authorizes a password change for ${account}.`,
        '',
        'If you did not request this code, ignore this email.',
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
          <h2 style="margin: 0 0 12px;">Admin password verification</h2>
          <p style="margin: 0 0 8px;">Your one-time password is:</p>
          <p style="font-size: 30px; letter-spacing: 8px; font-weight: 700; margin: 12px 0;">${code}</p>
          <p style="margin: 0 0 8px;">This code expires in ${minutes} minute(s) and can only be used once.</p>
          <p style="margin: 0 0 8px;">It authorizes a password change for <strong>${account}</strong>.</p>
          <p style="margin: 16px 0 0; color: #6b7280; font-size: 12px;">If you did not request this code, ignore this email.</p>
        </div>
      `,
    });
  } finally {
    transporter.close();
  }
}
