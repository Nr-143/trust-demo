import { useState, useRef, useEffect } from 'react';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  RotateCcw,
  AlertTriangle,
  Download,
  Upload,
  Database,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  KeyRound,
  Mail,
  Send,
  Loader2,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import {
  getStorageStats,
  exportDatabaseJSON,
  importDatabaseJSON,
} from '../../services/storageService';
import {
  sendPasswordOtp,
  verifyPasswordOtp,
  updateAdminPassword,
  validateNewPassword,
  validateOtp,
  PASSWORD_MIN_LENGTH,
} from '../../services/adminPassword';

export default function AdminSettings() {
  const state = useSite();
  const dispatch = useSiteDispatch();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef(null);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const stats = getStorageStats();

  const [otpSent, setOtpSent] = useState(false);
  const [otpDelivery, setOtpDelivery] = useState(null);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setTimeout(() => setResendCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const resetPasswordForm = () => {
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setOtpDelivery(null);
  };

  const handleSendOtp = async () => {
    setPasswordError('');
    setSendingOtp(true);
    try {
      const delivery = await sendPasswordOtp(user?.email);
      setOtpDelivery(delivery);
      setOtpSent(true);
      setResendCooldown(60);
      const channel = delivery.channel === 'smtp' ? 'SMTP' : 'Supabase';
      showSuccess(
        `Verification code sent via ${channel} to ${delivery.recipient}. Check that inbox and spam folder.`,
        'OTP Sent'
      );
    } catch (err) {
      const message = err.message || 'Could not send the verification code.';
      setPasswordError(message);
      showError(message, 'OTP Failed');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    const otpValidation = validateOtp(otp);
    if (otpValidation) {
      setPasswordError(otpValidation);
      return;
    }

    const passwordValidation = validateNewPassword(newPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('The new passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await verifyPasswordOtp(user?.email, otp, otpDelivery?.challenge);
      await updateAdminPassword(newPassword);
      resetPasswordForm();
      setOtpSent(false);
      showSuccess(
        'Your admin password has been updated. Use the new password the next time you sign in.',
        'Password Updated'
      );
    } catch (err) {
      const message = err.message || 'Could not update the password.';
      setPasswordError(message);
      showError(message, 'Password Update Failed');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleResetConfirmed = () => {
    try {
      dispatch({ type: 'RESET_STATE' });
      setConfirmResetOpen(false);
      showSuccess(
        'All records have been reset to default initial state.',
        'Reset Complete'
      );
    } catch (err) {
      showError(err.message || 'Failed to reset local cache data', 'Error');
    }
  };

  const handleExport = () => {
    try {
      exportDatabaseJSON();
      showSuccess('Database exported successfully as JSON file.', 'Backup Created');
    } catch (err) {
      showError(err.message || 'Export failed', 'Error');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') return;

      const result = importDatabaseJSON(content);
      if (result.success) {
        dispatch({ type: 'IMPORT_DATABASE', payload: result.data });
        showSuccess('Backup restored successfully!', 'Import Complete');
      } else {
        showError(result.error || 'Failed to import JSON file', 'Import Error');
      }
    };
    reader.onerror = () => showError('Failed to read file', 'File Error');
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-dark">Settings &amp; Security</h1>
        <p className="text-sm text-gray-500 mt-1">
          Change the admin password, monitor browser storage, export backups, or manage
          application cache.
        </p>
      </div>

      <div className="space-y-6">
        {/* 0. Admin Password Security */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-[#176B36]">
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-primary-dark">Admin Password</h2>
              <p className="text-xs text-gray-500">
                Verify a one-time code sent to your email before changing the password.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 mb-4">
            <Mail size={16} className="text-stone-500 shrink-0 mt-0.5" />
            <div>
              <p>
                One-time codes are sent to{' '}
                <strong className="text-stone-800">
                  {otpDelivery?.recipient || user?.email || 'your admin email'}
                </strong>
                .
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                To receive codes at a test address, set{' '}
                <code className="font-mono text-[10px] text-stone-700">OTP_RECIPIENT_EMAIL</code>{' '}
                and the <code className="font-mono text-[10px] text-stone-700">SMTP_*</code>{' '}
                values in <code className="font-mono text-[10px] text-stone-700">.env</code>. When
                SMTP is not configured, Supabase sends to the admin account email.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp || resendCooldown > 0 || !user?.email}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#173B2A] hover:bg-[#176B36] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sendingOtp ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              <span>
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : otpSent
                    ? 'Resend OTP'
                    : 'Send OTP to Email'}
              </span>
            </button>

            {otpSent && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 size={14} />
                <span>Code sent. Enter it below with your new password.</span>
              </span>
            )}
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email OTP
                </label>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="6-digit code"
                  disabled={!otpSent}
                  className="w-full px-3.5 py-2.5 text-sm tracking-[0.35em] bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B36]/30 focus:border-[#176B36] transition-all disabled:bg-stone-100 disabled:text-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New admin password"
                    autoComplete="new-password"
                    disabled={!otpSent}
                    className="w-full pl-10 pr-11 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B36]/30 focus:border-[#176B36] transition-all disabled:bg-stone-100 disabled:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    title={showNewPassword ? 'Hide new password' : 'Show new password'}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                    <ShieldCheck size={16} />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter the new password"
                    autoComplete="new-password"
                    disabled={!otpSent}
                    className="w-full pl-10 pr-11 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B36]/30 focus:border-[#176B36] transition-all disabled:bg-stone-100 disabled:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                    title={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-500">
              Use at least {PASSWORD_MIN_LENGTH} characters with at least one letter and one number.
              The code is single-use and expires according to your Supabase email OTP settings.
            </p>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={updatingPassword || !otpSent}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#176B36] hover:bg-[#173B2A] active:bg-emerald-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {updatingPassword ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Verifying &amp; Updating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>Verify OTP &amp; Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 1. Storage Overview & Stats */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-[#176B36]">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-primary-dark">Local Storage Diagnostics</h2>
              <p className="text-xs text-gray-500">Live storage footprints across all data modules</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Total Storage
              </span>
              <span className="text-xl font-extrabold text-[#173B2A] mt-0.5 block">
                {stats.kilobytes}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Programmes
              </span>
              <span className="text-xl font-extrabold text-[#173B2A] mt-0.5 block">
                {state.programmes?.length || 0}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Campaigns
              </span>
              <span className="text-xl font-extrabold text-[#173B2A] mt-0.5 block">
                {state.campaigns?.length || 0}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Donations & Pledges
              </span>
              <span className="text-xl font-extrabold text-amber-700 mt-0.5 block">
                {state.demoDonations?.length || 0}
              </span>
            </div>
          </div>

          {/* Module Record Counts Breakdown */}
          <div className="pt-4 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
            <div>
              Stories: <strong className="text-gray-900">{state.stories?.length || 0}</strong>
            </div>
            <div>
              Volunteers: <strong className="text-gray-900">{state.volunteerApplications?.length || 0}</strong>
            </div>
            <div>
              Careers: <strong className="text-gray-900">{state.careers?.length || 0}</strong>
            </div>
            <div>
              Enquiries: <strong className="text-gray-900">{state.contactEnquiries?.length || 0}</strong>
            </div>
          </div>
        </div>

        {/* 2. Backup & Export / Import Actions */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <HardDrive size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-primary-dark">Backup & Portability</h2>
              <p className="text-xs text-gray-500">
                Export current website content and records to a JSON file or restore from a previous file
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#173B2A] hover:bg-[#176B36] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>Export Full Database (JSON)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl border border-stone-300 transition-colors cursor-pointer"
            >
              <Upload size={14} />
              <span>Import Database (JSON)</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* 3. Clearly Labelled Reset Demo Data Action */}
        <div className="bg-white border border-rose-200 rounded-2xl p-6 sm:p-7 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0">
              <RotateCcw size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-rose-900">
                Reset Local Application Cache
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed mt-1 mb-4">
                This action clears any locally cached submissions or overrides in this browser and re-synchronizes with default records.
              </p>

              {confirmResetOpen ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                    <span>Are you sure you want to reset all data?</span>
                  </div>
                  <p className="leading-relaxed">
                    All local cache edits made in this browser will be wiped and re-synchronized.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleResetConfirmed}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Yes, Reset Everything
                    </button>
                    <button
                      onClick={() => setConfirmResetOpen(false)}
                      className="px-4 py-2 bg-white border border-stone-300 text-stone-700 font-semibold rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmResetOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Reset Local Cache</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
