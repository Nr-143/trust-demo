/**
 * Admin Password Service
 *
 * Password changes require a valid one-time code. When SMTP is configured the
 * code is generated and verified by the /api routes and delivered to
 * OTP_RECIPIENT_EMAIL; otherwise it is sent and verified by Supabase Auth.
 * Only after the code is accepted is the new password submitted. Supabase
 * stores the password hashed; the app never stores or logs plaintext passwords.
 */

import { supabase } from './supabaseClient';

export const OTP_LENGTH_MIN = 6;
export const OTP_LENGTH_MAX = 10;
export const PASSWORD_MIN_LENGTH = 8;

const OTP_API_PATHS = {
  send: '/api/send-password-otp',
  verify: '/api/verify-password-otp',
};

async function getAccessToken() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add the Supabase environment variables first.');
  }
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error('Could not read the admin session. Please sign in again.');
  const token = data?.session?.access_token;
  if (!token) throw new Error('Your admin session has expired. Please sign in again.');
  return token;
}

async function callOtpApi(path, body) {
  let token;
  try {
    token = await getAccessToken();
  } catch (error) {
    return { unavailable: false, sessionError: error };
  }

  let response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body || {}),
    });
  } catch {
    return { unavailable: true };
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    // Vite's dev server answers unknown paths with index.html (HTTP 200), and
    // Vercel answers a missing route with 404. Treat those as "API routes are
    // not running" so callers can fall back to Supabase email OTP. Any other
    // status is a real server error and should be shown to the admin.
    if (response.status === 200 || response.status === 404) {
      return { unavailable: true };
    }
    return {
      response,
      payload: { error: `The verification service returned HTTP ${response.status}.` },
    };
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    return { unavailable: true };
  }

  return { response, payload };
}

function friendlyApiError(message, fallback) {
  if (!message) return fallback;
  const normalized = message.toLowerCase();
  if (normalized.includes('rate limit') || normalized.includes('too many')) {
    return 'Too many OTP requests. Please wait a minute and try again.';
  }
  return message;
}

function friendlyAuthError(error, fallback) {
  const message = error?.message || fallback;
  const normalized = message.toLowerCase();

  if (normalized.includes('rate limit') || normalized.includes('too many')) {
    return 'Too many OTP requests. Please wait a minute and try again.';
  }
  if (
    normalized.includes('token') ||
    normalized.includes('otp') ||
    normalized.includes('invalid') ||
    normalized.includes('expired')
  ) {
    return 'The verification code is invalid or has expired. Please request a new code.';
  }
  if (normalized.includes('smtp') || normalized.includes('email')) {
    return `The verification email could not be sent: ${message}`;
  }
  return message;
}

export function validateNewPassword(password) {
  if (!password) return 'Enter a new password.';
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `The password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'The password must include at least one letter and one number.';
  }
  return null;
}

export function validateOtp(otp) {
  const code = (otp || '').trim();
  if (!/^\d+$/.test(code)) return 'Enter only the numbers from the email code.';
  if (code.length < OTP_LENGTH_MIN || code.length > OTP_LENGTH_MAX) {
    return `The code should be ${OTP_LENGTH_MIN} to ${OTP_LENGTH_MAX} digits.`;
  }
  return null;
}

export async function sendPasswordOtp(email) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add the Supabase environment variables first.');
  }

  const apiResult = await callOtpApi(OTP_API_PATHS.send);
  if (apiResult.sessionError) throw apiResult.sessionError;

  if (!apiResult.unavailable) {
    const { response, payload } = apiResult;
    const smtpNotConfigured =
      response.status === 404 ||
      response.status === 501 ||
      payload?.code === 'SMTP_NOT_CONFIGURED';

    if (!smtpNotConfigured) {
      if (!response.ok) {
        throw new Error(
          friendlyApiError(payload?.error, 'Could not send the verification code.')
        );
      }
      return {
        channel: 'smtp',
        recipient: payload?.recipient || email,
        challenge: payload?.challenge || null,
        expiresAt: payload?.expiresAt || null,
        otpLength: payload?.otpLength || null,
      };
    }
  }

  if (!email) {
    throw new Error('The signed-in admin account has no email address.');
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  if (error) {
    throw new Error(friendlyAuthError(error, 'Could not send the verification code.'));
  }

  return { channel: 'supabase', recipient: email, challenge: null };
}

export async function verifyPasswordOtp(email, otp, challenge) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add the Supabase environment variables first.');
  }

  const code = (otp || '').trim();
  const validationError = validateOtp(code);
  if (validationError) throw new Error(validationError);

  if (challenge) {
    const apiResult = await callOtpApi(OTP_API_PATHS.verify, { challenge, otp: code });
    if (apiResult.sessionError) throw apiResult.sessionError;
    if (apiResult.unavailable) {
      throw new Error(
        'The verification service is not running. Start the app with "npm run dev:cloudinary" so the /api routes run.'
      );
    }
    if (!apiResult.response.ok) {
      throw new Error(
        friendlyApiError(
          apiResult.payload?.error,
          'The verification code is invalid or has expired. Please request a new code.'
        )
      );
    }
    return apiResult.payload;
  }

  if (!email) {
    throw new Error('The signed-in admin account has no email address.');
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'email',
  });

  if (error) {
    throw new Error(friendlyAuthError(error, 'Could not verify the code.'));
  }

  return data;
}

export async function updateAdminPassword(password) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add the Supabase environment variables first.');
  }

  const validationError = validateNewPassword(password);
  if (validationError) throw new Error(validationError);

  const { data, error } = await supabase.auth.updateUser({ password });

  if (error) {
    throw new Error(friendlyAuthError(error, 'Could not update the password.'));
  }

  return data;
}
