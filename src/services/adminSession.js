/**
 * Admin Session Guard
 *
 * Enforces a maximum session lifetime of 24 hours and permits only one
 * administrator session at a time. The browser keeps the local session
 * marker; when the optional Supabase table is available it is also used as
 * the cross-device source of truth.
 */

export const ADMIN_SESSION_STORAGE_KEY = 'mmg_trust_admin_session_v1';
export const ADMIN_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const ACTIVE_SESSION_TABLE = 'admin_active_session';
const ACTIVE_SESSION_ROW_ID = 'global';
const SERVER_RECHECK_MS = 60 * 1000;

let serverSessionAvailable = true;
let missingTableWarned = false;

export const SESSION_REASONS = {
  expired: 'Your admin session expired after 24 hours. Please sign in again.',
  superseded: 'Another administrator signed in, so this session was signed out. Please sign in again.',
  signedOut: 'You were signed out in another tab. Please sign in again.',
};

export function getSessionRecheckInterval() {
  return SERVER_RECHECK_MS;
}

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function isMissingTableError(error) {
  if (!error) return false;
  const code = error.code || '';
  const message = (error.message || '').toLowerCase();
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('could not find the table')
  );
}

function handleServerError(error) {
  if (isMissingTableError(error)) {
    serverSessionAvailable = false;
    if (!missingTableWarned) {
      missingTableWarned = true;
      console.warn(
        '[AdminSession] The optional admin_active_session table was not found. Single-session enforcement will stay limited to this browser. Run supabase/schema.sql to enable cross-device enforcement.'
      );
    }
    return;
  }
  console.warn('[AdminSession] Could not reach the session registry:', error?.message || error);
}

export function getLocalAdminSession() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.id || !parsed.expiresAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeLocalAdminSession(record) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(record));
  } catch (error) {
    console.warn('[AdminSession] Could not persist the local admin session:', error?.message || error);
  }
}

export function clearLocalAdminSession(sessionId) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (!sessionId) {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      return;
    }
    const current = getLocalAdminSession();
    if (!current || current.id === sessionId) {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage restrictions.
  }
}

async function claimActiveSession(client, record) {
  if (!client || !serverSessionAvailable) return;
  try {
    const { error } = await client.from(ACTIVE_SESSION_TABLE).upsert(
      {
        id: ACTIVE_SESSION_ROW_ID,
        session_id: record.id,
        email: record.email || null,
        started_at: new Date(record.startedAt).toISOString(),
        expires_at: new Date(record.expiresAt).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) throw error;
  } catch (error) {
    handleServerError(error);
  }
}

async function fetchActiveSession(client) {
  if (!client || !serverSessionAvailable) return null;
  try {
    const { data, error } = await client
      .from(ACTIVE_SESSION_TABLE)
      .select('session_id, email, expires_at')
      .eq('id', ACTIVE_SESSION_ROW_ID)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    handleServerError(error);
    return null;
  }
}

export async function startAdminSession(client, authUser) {
  const startedAt = Date.now();
  const record = {
    id: createSessionId(),
    userId: authUser?.id || null,
    email: authUser?.email || '',
    startedAt,
    expiresAt: startedAt + ADMIN_SESSION_TTL_MS,
  };

  writeLocalAdminSession(record);

  if (record.id) {
    await claimActiveSession(client, record);
  }

  return record;
}

export async function verifyAdminSession(client, record) {
  if (!record?.id) {
    return { valid: false, reason: SESSION_REASONS.expired };
  }

  const active = await fetchActiveSession(client);

  if (active?.session_id && active.session_id !== record.id) {
    return { valid: false, reason: SESSION_REASONS.superseded };
  }

  if (Date.now() >= record.expiresAt) {
    return { valid: false, reason: SESSION_REASONS.expired };
  }

  if (active?.expires_at && new Date(active.expires_at).getTime() <= Date.now()) {
    return { valid: false, reason: SESSION_REASONS.expired };
  }

  return { valid: true };
}

export async function endAdminSession(client, record) {
  clearLocalAdminSession(record?.id);

  if (!client || !record?.id || !serverSessionAvailable) return;

  try {
    // Keep the row as a marker (session_id is not cleared) so an older
    // session that reconnects still detects that it was superseded.
    const { error } = await client
      .from(ACTIVE_SESSION_TABLE)
      .update({
        expires_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', ACTIVE_SESSION_ROW_ID)
      .eq('session_id', record.id);
    if (error) throw error;
  } catch (error) {
    handleServerError(error);
  }
}
