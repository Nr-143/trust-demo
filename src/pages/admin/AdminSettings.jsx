import { useState, useRef } from 'react';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
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
  Info,
} from 'lucide-react';
import {
  getStorageStats,
  exportDatabaseJSON,
  importDatabaseJSON,
} from '../../services/storageService';

export default function AdminSettings() {
  const state = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError, showInfo } = useToast();
  const fileInputRef = useRef(null);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const stats = getStorageStats();

  const handleResetConfirmed = () => {
    try {
      dispatch({ type: 'RESET_STATE' });
      setConfirmResetOpen(false);
      showSuccess(
        'All records have been reset to default initial demonstration data.',
        'Reset Complete'
      );
    } catch (err) {
      showError(err.message || 'Failed to reset demonstration data', 'Error');
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
        <h1 className="text-2xl font-bold text-primary-dark">Settings & Data Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor browser storage, export backups, or restore factory demonstration records.
        </p>
      </div>

      <div className="space-y-6">
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
                Demo Donations
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
                Reset Demonstration Data
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed mt-1 mb-4">
                This action erases any custom programmes, edited headlines, volunteer submissions, or
                pledged demo donations created in this browser, and restores the factory demonstration records.
              </p>

              {confirmResetOpen ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                    <span>Are you sure you want to reset all data?</span>
                  </div>
                  <p className="leading-relaxed">
                    All edits made in this browser will be wiped and replaced with the original demo content.
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
                  <span>Reset All Demo Data</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. Local-Only Storage Disclaimer */}
        <div className="p-5 rounded-2xl bg-stone-100/80 border border-stone-200 text-xs text-stone-600 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-stone-800">
            <Info size={15} className="text-[#176B36]" />
            <span>Browser-Local Architecture Disclosure</span>
          </div>
          <p>
            This demo application operates strictly within your browser's LocalStorage and IndexedDB
            without external database or cloud servers.
          </p>
          <p className="text-[11px] text-stone-500">
            <strong>Notice:</strong> Data created or modified on this device is not shared with or visible
            to other users on other devices. Multi-tab synchronization is active for tabs opened within
            this browser.
          </p>
        </div>
      </div>
    </div>
  );
}
