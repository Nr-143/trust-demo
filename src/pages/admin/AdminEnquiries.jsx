import { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Trash2,
  Mail,
  CheckCircle2,
  Clock,
  Archive,
  RefreshCw,
  Send,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/helpers';
import ConfirmModal from '../../components/common/ConfirmModal';

const STATUS_OPTIONS = ['new', 'read', 'responded', 'archived'];

export default function AdminEnquiries() {
  const { contactEnquiries } = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError } = useToast();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingEnquiry, setViewingEnquiry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch enquiries from Supabase (falling back to SiteContext/LocalStorage)
  const fetchEnquiries = async () => {
    setLoading(true);
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('contact_enquiries')
          .select('*')
          .order('submitted_at', { ascending: false });

        if (error) throw error;
        const normalized = (data || []).map((e) => ({
          ...e,
          submittedAt: e.submitted_at || e.created_at || new Date().toISOString(),
        }));
        setEnquiries(normalized);
        dispatch({ type: 'SET_CONTACT_ENQUIRIES', payload: normalized });
      } catch (err) {
        console.error('Failed to load enquiries from Supabase:', err);
        showError('Could not fetch cloud enquiries; showing local records.', 'Notice');
        setEnquiries(contactEnquiries || []);
      } finally {
        setLoading(false);
      }
    } else {
      setEnquiries(contactEnquiries || []);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [contactEnquiries]);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (item.name || '').toLowerCase().includes(q) ||
        (item.email || '').toLowerCase().includes(q) ||
        (item.subject || '').toLowerCase().includes(q) ||
        (item.message || '').toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (item.status || 'new').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, searchQuery, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('contact_enquiries')
          .update({ status: newStatus })
          .eq('id', id);

        if (error) throw error;
      }

      // Update local state
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );

      // Also dispatch to local context
      dispatch({
        type: 'UPDATE_CONTACT_ENQUIRY',
        payload: { id, status: newStatus },
      });

      if (viewingEnquiry && viewingEnquiry.id === id) {
        setViewingEnquiry({ ...viewingEnquiry, status: newStatus });
      }

      showSuccess(`Enquiry marked as "${newStatus}".`, 'Status Updated');
    } catch (err) {
      showError(err.message || 'Failed to update status', 'Error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('contact_enquiries')
          .delete()
          .eq('id', deleteTarget.id);

        if (error) throw error;
      }

      setEnquiries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      dispatch({ type: 'DELETE_CONTACT_ENQUIRY', payload: deleteTarget.id });
      showSuccess('Enquiry record deleted permanently.', 'Deleted');
      setDeleteTarget(null);
    } catch (err) {
      showError(err.message || 'Failed to delete record', 'Error');
    }
  };

  const getStatusBadge = (status) => {
    switch ((status || 'new').toLowerCase()) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'read':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'responded':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'archived':
        return 'bg-stone-100 text-stone-600 border-stone-200';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  const newCount = enquiries.filter((e) => e.status === 'new').length;
  const respondedCount = enquiries.filter((e) => e.status === 'responded').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-teal-100 text-teal-800">
              <MessageSquare size={14} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Enquiry Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#173B2A]">Contact Enquiries</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Incoming public messages, grassroots project inquiries, and community communication.
          </p>
        </div>

        <button
          onClick={fetchEnquiries}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white border border-stone-300 rounded-xl hover:bg-stone-50 text-stone-700 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Total Inquiries
          </span>
          <span className="text-2xl font-extrabold text-[#173B2A] mt-1 block">
            {enquiries.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
            New / Unread
          </span>
          <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
            {newCount}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Responded
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
            {respondedCount}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Cloud Sync Status
          </span>
          <span className="text-xs font-bold text-[#176B36] mt-2 flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            <span>{isSupabaseConfigured() ? 'Supabase Active' : 'Local Fallback'}</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'new', 'read', 'responded', 'archived'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-[#173B2A] text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search enquiries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B36]/20 focus:border-[#176B36]"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
        {filteredEnquiries.length === 0 ? (
          <div className="text-center py-16 px-4">
            <MessageSquare size={36} className="mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-semibold text-stone-700">No enquiries found</p>
            <p className="text-xs text-stone-400 mt-0.5">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'Incoming contact messages will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Sender</th>
                  <th className="px-4 py-3.5">Subject</th>
                  <th className="px-4 py-3.5">Preview</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-[#173B2A] text-xs">{enq.name}</p>
                      <a
                        href={`mailto:${enq.email}`}
                        className="text-[11px] text-[#176B36] hover:underline block truncate max-w-[180px]"
                      >
                        {enq.email}
                      </a>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-stone-800 line-clamp-1">
                        {enq.subject}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-stone-500 line-clamp-1 max-w-xs">
                        {enq.message}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-stone-500 whitespace-nowrap">
                      {formatDate(enq.submitted_at || enq.submittedAt || enq.created_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={enq.status || 'new'}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${getStatusBadge(
                          enq.status
                        )}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingEnquiry(enq)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="View Full Enquiry"
                          aria-label="View Enquiry"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(enq)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Record"
                          aria-label="Delete Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW ENQUIRY DETAIL MODAL */}
      {viewingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Enquiry Detail
                </span>
                <h3 className="text-lg font-bold text-[#173B2A] mt-1.5">
                  {viewingEnquiry.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingEnquiry(null)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">
                    Sender Name
                  </span>
                  <span className="font-bold text-stone-800 text-sm">
                    {viewingEnquiry.name}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">
                    Date Received
                  </span>
                  <span className="text-stone-600">
                    {formatDate(viewingEnquiry.submitted_at || viewingEnquiry.submittedAt)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold mb-1">
                  Email Address
                </span>
                <a
                  href={`mailto:${viewingEnquiry.email}?subject=Re: ${encodeURIComponent(
                    viewingEnquiry.subject
                  )}`}
                  className="font-semibold text-[#176B36] hover:underline flex items-center gap-1.5"
                >
                  <Mail size={13} />
                  <span>{viewingEnquiry.email}</span>
                </a>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold mb-1">
                  Message Content
                </span>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-800 leading-relaxed whitespace-pre-wrap">
                  {viewingEnquiry.message}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <a
                href={`mailto:${viewingEnquiry.email}?subject=Re: ${encodeURIComponent(
                  viewingEnquiry.subject
                )}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176B36] text-white text-xs font-bold hover:bg-[#173B2A] transition-colors"
              >
                <Send size={13} />
                <span>Reply Via Email</span>
              </a>

              <button
                type="button"
                onClick={() => setViewingEnquiry(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Contact Enquiry"
        message={`Are you sure you want to delete the enquiry from "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete Enquiry"
        danger
      />
    </div>
  );
}

