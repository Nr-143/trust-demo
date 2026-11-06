/**
 * AuthContext - Admin Authentication Layer
 *
 * Manages Supabase session, admin credentials verification,
 * and reactive login/logout state across administrative views.
 *
 * Security rules enforced here:
 *  - An admin session expires automatically 24 hours after sign-in.
 *  - Only one admin session may be active; a newer sign-in signs out older ones.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import {
  ADMIN_SESSION_STORAGE_KEY,
  SESSION_REASONS,
  getLocalAdminSession,
  getSessionRecheckInterval,
  startAdminSession,
  verifyAdminSession,
  endAdminSession,
} from '../services/adminSession';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  isConfigured: false,
  sessionNotice: null,
  login: async () => {},
  logout: async () => {},
  clearSessionNotice: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminSession, setAdminSessionState] = useState(null);
  const [sessionNotice, setSessionNotice] = useState(null);

  const adminSessionRef = useRef(null);
  const startingRef = useRef(null);
  const signingOutRef = useRef(false);
  const loginInProgressRef = useRef(false);
  const blockedRef = useRef(false);

  const setAdminSession = useCallback((record) => {
    adminSessionRef.current = record;
    setAdminSessionState(record);
  }, []);

  const forceLogout = useCallback(
    async (reason) => {
      if (signingOutRef.current) return;
      signingOutRef.current = true;
      blockedRef.current = true;
      try {
        const current = adminSessionRef.current || getLocalAdminSession();
        const marker = getLocalAdminSession();
        // Only clear the Supabase session when this browser still holds our
        // admin marker. A newer sign-in in the same browser owns the shared
        // Supabase storage now, so signing out here would evict that session.
        const ownsBrowserSession = !marker || marker.id === current?.id;

        setAdminSession(null);
        if (current) {
          await endAdminSession(supabase, current);
        }
        setSessionNotice(reason || null);

        if (supabase && ownsBrowserSession) {
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch {
            // Local sign-out failures should not block clearing app state.
          }
        }

        setUser(null);
        setSession(null);
      } finally {
        signingOutRef.current = false;
      }
    },
    [setAdminSession]
  );

  const beginAdminSession = useCallback(
    async (authUser) => {
      if (startingRef.current) return startingRef.current;
      const promise = (async () => {
        const started = await startAdminSession(supabase, authUser);
        blockedRef.current = false;
        setAdminSession(started);
        setSessionNotice(null);
        return started;
      })();
      startingRef.current = promise;
      try {
        return await promise;
      } finally {
        startingRef.current = null;
      }
    },
    [setAdminSession]
  );

  const ensureAdminSession = useCallback(
    async (authSession) => {
      if (!authSession?.user) return false;

      const existing = getLocalAdminSession();
      if (existing) {
        if (existing.userId && existing.userId !== authSession.user.id) {
          await forceLogout(SESSION_REASONS.superseded);
          return false;
        }

        if (Date.now() >= existing.expiresAt) {
          await forceLogout(SESSION_REASONS.expired);
          return false;
        }

        setAdminSession(existing);
        const result = await verifyAdminSession(supabase, existing);
        if (!result.valid) {
          await forceLogout(result.reason);
          return false;
        }
        return true;
      }

      const started = await beginAdminSession(authSession.user);
      return Boolean(started);
    },
    [beginAdminSession, forceLogout, setAdminSession]
  );

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession } }) => {
        if (!active) return;

        if (!initialSession?.user) {
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        const allowed = await ensureAdminSession(initialSession);
        if (!active) return;

        if (allowed) {
          setSession(initialSession);
          setUser(initialSession.user);
        }
        setLoading(false);
      })
      .catch((error) => {
        if (!active) return;
        console.error('[Auth] Could not restore the admin session:', error);
        setUser(null);
        setSession(null);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, authSession) => {
      if (!active) return;

      // The initial session is verified by getSession() above so the app can
      // wait for the 24-hour and single-session checks before rendering.
      if (event === 'INITIAL_SESSION') return;

      // Ignore token refreshes and cross-tab events after this session was
      // invalidated, otherwise Supabase could restore the logged-out user.
      if (blockedRef.current && !authSession?.user) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      if (blockedRef.current) return;

      if (!authSession?.user) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setSession(authSession);
      setUser(authSession.user);

      // A fresh sign-in is handled by login() so a new 24-hour window starts
      // even if an expired local marker is still present.
      if (event === 'SIGNED_IN' && !loginInProgressRef.current) {
        void ensureAdminSession(authSession);
      }

      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [ensureAdminSession]);

  // Sign out this tab immediately when another tab starts a new session.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== ADMIN_SESSION_STORAGE_KEY) return;

      const current = adminSessionRef.current;
      if (!current) return;

      let incoming = null;
      if (event.newValue) {
        try {
          incoming = JSON.parse(event.newValue);
        } catch {
          incoming = null;
        }
      }

      if (!incoming) {
        void forceLogout(SESSION_REASONS.signedOut);
      } else if (incoming.id !== current.id) {
        void forceLogout(SESSION_REASONS.superseded);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [forceLogout]);

  // Enforce the 24-hour limit and detect a newer sign-in on another device.
  useEffect(() => {
    if (!user || !adminSession || !supabase) return;

    let cancelled = false;

    const check = async () => {
      if (cancelled) return;
      const current = adminSessionRef.current;
      if (!current) return;

      const result = await verifyAdminSession(supabase, current);
      if (cancelled) return;
      if (!result.valid) {
        await forceLogout(result.reason);
      }
    };

    const msUntilExpiry = Math.max(adminSession.expiresAt - Date.now(), 0);
    const expiryTimer = setTimeout(check, msUntilExpiry + 500);
    const intervalTimer = setInterval(check, getSessionRecheckInterval());

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void check();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      cancelled = true;
      clearTimeout(expiryTimer);
      clearInterval(intervalTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [user, adminSession, forceLogout]);

  const login = async (email, password) => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error(
        'Supabase credentials are not configured. Please check your Vercel or local environment variables.'
      );
    }

    blockedRef.current = false;
    loginInProgressRef.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data?.user) {
        await beginAdminSession(data.user);
      }

      return data;
    } finally {
      loginInProgressRef.current = false;
    }
  };

  const logout = async () => {
    const current = adminSessionRef.current || getLocalAdminSession();
    const marker = getLocalAdminSession();
    const ownsBrowserSession = !marker || marker.id === current?.id;
    setAdminSession(null);

    if (current) {
      await endAdminSession(supabase, current);
    }

    if (supabase && ownsBrowserSession) {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    setUser(null);
    setSession(null);
    setSessionNotice(null);
  };

  const clearSessionNotice = useCallback(() => setSessionNotice(null), []);

  const value = {
    user,
    session,
    loading,
    isAuthenticated: Boolean(user),
    isConfigured: isSupabaseConfigured(),
    sessionNotice,
    login,
    logout,
    clearSessionNotice,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
