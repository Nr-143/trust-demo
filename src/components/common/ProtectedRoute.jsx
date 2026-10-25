import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, isConfigured } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F2] p-4">
        <Loader2 size={36} className="text-[#176B36] animate-spin mb-3" />
        <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
          Verifying Administrator Session...
        </p>
      </div>
    );
  }

  // If Supabase is not configured yet, show a clear configuration guide instead of silent bypass
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F2] p-4">
        <div className="max-w-md w-full bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-lg text-center">
          <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-xl font-bold text-[#173B2A]">Admin Security Notice</h2>
          <p className="text-xs text-stone-600 mt-2 leading-relaxed">
            Administrative access requires verified Supabase authentication. Environment variables{' '}
            <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono text-[11px]">
              VITE_SUPABASE_URL
            </code>{' '}
            and{' '}
            <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono text-[11px]">
              VITE_SUPABASE_ANON_KEY
            </code>{' '}
            must be configured in your environment or Vercel settings.
          </p>
          <div className="mt-6 pt-4 border-t border-stone-100">
            <a
              href="/"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#173B2A] text-white text-xs font-semibold hover:bg-emerald-900 transition-colors"
            >
              Return to Public Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

