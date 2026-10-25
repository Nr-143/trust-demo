import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/admin';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      showSuccess('Welcome back, Administrator.', 'Session Authenticated');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid administrator credentials.';
      setErrorMessage(msg);
      showError(msg, 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAF8F2] px-4 py-12">
      <div className="max-w-md w-full bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* NGO Brand Emblem */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block group mb-3">
            <img
              src="/images/originalLogo.jpeg"
              alt="Mannin Maindhan Grama Arakkattalai"
              className="h-16 w-16 mx-auto rounded-full object-cover ring-4 ring-emerald-700/20 group-hover:ring-emerald-700 transition-all shadow-sm"
              onError={(e) => {
                e.currentTarget.src = '/images/originalLogo.jpeg';
              }}
            />
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-[#176B36] border border-emerald-200 mb-2">
            <ShieldCheck size={13} />
            <span>Authorized Personnel Only</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#173B2A] tracking-tight">
            Admin Console Sign In
          </h1>
          <p className="text-xs text-stone-500 font-tamil mt-0.5">
            மண்ணின் மைந்தன் கிராம அறக்கட்டளை • நிர்வாகி தளம்
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@manninmaindhan.org"
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B36]/30 focus:border-[#176B36] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B36]/30 focus:border-[#176B36] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#176B36] hover:bg-[#173B2A] active:bg-emerald-950 text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Access Admin Console</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Notice */}
        <div className="mt-6 pt-5 border-t border-stone-100 text-center space-y-3">
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Protected by Supabase Row-Level Security. Administrative sessions are cryptographically signed.
          </p>
          <Link
            to="/"
            className="inline-block text-xs font-semibold text-[#176B36] hover:text-[#173B2A] transition-colors"
          >
            &larr; Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}

