import { useState, useMemo, useEffect } from 'react';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  Phone,
  Mail,
  UserCheck,
  X,
  Calendar,
  Clock,
  Award,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import ConfirmModal from '../../components/common/ConfirmModal';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';

const STATUS_OPTIONS = ['New', 'Reviewed', 'Contacted', 'Accepted', 'Rejected'];

export default function AdminVolunteers() {
  const { volunteerApplications, volunteers } = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError } = useToast();

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingVolunteer, setViewingVolunteer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cloudList, setCloudList] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchVolunteers = async () => {
    if (isSupabaseConfigured() && supabase) {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('volunteer_applications')
          .select('*')
          .order('submitted_at', { ascending: false });

        if (error) throw error;
        const normalized = (data || []).map((item) => ({
          ...item,
          preferredOpportunity: item.preferred_opportunity || item.preferredOpportunity || item.area,
          submittedAt: item.submitted_at || item.created_at,
        }));
        setCloudList(normalized);
        dispatch({ type: 'SET_VOLUNTEER_APPLICATIONS', payload: normalized });
      } catch (err) {
        console.error('Failed to load volunteers from Supabase:', err);
        // Fall back to context
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const rawList = cloudList !== null ? cloudList : (volunteerApplications || volunteers || []);
  const list = rawList;

  const filtered = useMemo(() => {
    return list.filter((v) => {
      const matchesSearch =
        (v.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.area || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.preferredOpportunity || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.skills || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.message || '').toLowerCase().includes(searchQuery.toLowerCase());

      const status = v.status || 'New';
      const matchesStatus =
        filter === 'all' ||
        status.toLowerCase() === filter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [list, searchQuery, filter]);

  const handleStatusChange = async (id, newStatus, name) => {
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('volunteer_applications')
          .update({ status: newStatus })
          .eq('id', id);
        if (error) throw error;
      }

      if (cloudList !== null) {
        setCloudList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      }

      dispatch({
        type: 'SET_VOLUNTEER_APPLICATION_STATUS',
        payload: { id, status: newStatus },
      });
      showSuccess(`Status for ${name} updated to "${newStatus}".`, 'Status Updated');
      if (viewingVolunteer && viewingVolunteer.id === id) {
        setViewingVolunteer({ ...viewingVolunteer, status: newStatus });
      }
    } catch (err) {
      showError(err.message || 'Failed to update status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('volunteer_applications')
          .delete()
          .eq('id', deleteTarget.id);
        if (error) throw error;
      }

      if (cloudList !== null) {
        setCloudList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      }

      dispatch({ type: 'DELETE_VOLUNTEER_APPLICATION', payload: deleteTarget.id });
      showSuccess(`Volunteer record for "${deleteTarget.name}" deleted.`, 'Deleted');
      setDeleteTarget(null);
    } catch (err) {
      showError(err.message || 'Action failed');
    }
  };

  const getStatusBadgeStyle = (status) => {
    const s = (status || 'New').toLowerCase();
    switch (s) {
      case 'accepted':
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'new':
      case 'pending':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'reviewed':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'contacted':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div>
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Community Onboarding
            </span>
          </div>
          <h1 className="text-2xl font-bold text-primary-dark">Volunteer Registrations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review submissions, evaluate skills, and manage status transitions: New, Reviewed, Contacted, Accepted, Rejected.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSupabaseConfigured() && (
            <button
              onClick={fetchVolunteers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-600 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All', count: list.length },
              { id: 'New', label: 'New', count: list.filter((v) => (v.status || '').toLowerCase() === 'new' || v.status === 'pending').length },
              { id: 'Reviewed', label: 'Reviewed', count: list.filter((v) => (v.status || '').toLowerCase() === 'reviewed').length },
              { id: 'Contacted', label: 'Contacted', count: list.filter((v) => (v.status || '').toLowerCase() === 'contacted').length },
              { id: 'Accepted', label: 'Accepted', count: list.filter((v) => (v.status || '').toLowerCase() === 'accepted' || v.status === 'approved').length },
              { id: 'Rejected', label: 'Rejected', count: list.filter((v) => (v.status || '').toLowerCase() === 'rejected').length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    filter === tab.id ? 'bg-white/25 text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applicants, skills, roles..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-2xs">
          <UserCheck size={40} className="mx-auto text-stone-300 mb-3" />
          <h3 className="text-base font-bold text-stone-700">No applications in this view</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No volunteers matching "${searchQuery}". Clear your search query.`
              : 'New volunteer registrations submitted from the public site will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Volunteer</th>
                  <th className="px-4 py-3.5 hidden sm:table-cell">Contact Info</th>
                  <th className="px-4 py-3.5 hidden md:table-cell">Preferred Role & Skills</th>
                  <th className="px-4 py-3.5">Status Transition</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((vol) => (
                  <tr key={vol.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#173B2A] text-sm">{vol.name}</p>
                      <p className="text-xs text-stone-500 sm:hidden">{vol.phone}</p>
                      {vol.message && (
                        <p className="text-xs text-stone-500 italic mt-0.5 line-clamp-1">
                          &quot;{vol.message}&quot;
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4 text-xs text-stone-600 hidden sm:table-cell whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Phone size={13} className="text-stone-400" />
                        <span>{vol.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail size={13} className="text-stone-400" />
                        <span>{vol.email}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs text-stone-600 hidden md:table-cell max-w-xs">
                      <span className="font-semibold text-stone-800 block truncate">
                        {vol.preferredOpportunity || vol.area}
                      </span>
                      {vol.skills && (
                        <span className="text-[11px] text-stone-500 block truncate mt-0.5">
                          Skills: {vol.skills}
                        </span>
                      )}
                      <span className="block text-[10px] text-stone-400 mt-0.5">
                        {formatDate(vol.submittedAt)}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={vol.status || 'New'}
                        onChange={(e) => handleStatusChange(vol.id, e.target.value, vol.name)}
                        className={`text-xs font-semibold py-1 px-2.5 rounded-xl border focus:outline-none cursor-pointer transition-colors ${getStatusBadgeStyle(
                          vol.status
                        )}`}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingVolunteer(vol)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="View Volunteer Details"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(vol)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW VOLUNTEER DETAILS MODAL */}
      {viewingVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  Volunteer Application Profile
                </span>
                <h3 className="text-lg font-bold text-primary-dark mt-0.5">{viewingVolunteer.name}</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Submitted: {formatDate(viewingVolunteer.submittedAt)}
                </p>
              </div>
              <button
                onClick={() => setViewingVolunteer(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-stone-700">
                  <Phone size={14} className="text-stone-400 shrink-0" />
                  <span className="font-semibold">Phone:</span>
                  <a href={`tel:${viewingVolunteer.phone}`} className="text-primary hover:underline">
                    {viewingVolunteer.phone}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-stone-700">
                  <Mail size={14} className="text-stone-400 shrink-0" />
                  <span className="font-semibold">Email:</span>
                  <a href={`mailto:${viewingVolunteer.email}`} className="text-primary hover:underline">
                    {viewingVolunteer.email}
                  </a>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-700 block mb-0.5">Preferred Opportunity:</span>
                <span className="text-stone-900 font-semibold">{viewingVolunteer.preferredOpportunity || viewingVolunteer.area}</span>
              </div>

              {viewingVolunteer.skills && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="font-bold text-stone-700 block mb-0.5">Relevant Skills & Experience:</span>
                  <span className="text-stone-800">{viewingVolunteer.skills}</span>
                </div>
              )}

              {viewingVolunteer.availability && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="font-bold text-stone-700 block mb-0.5">Availability:</span>
                  <span className="text-stone-800">{viewingVolunteer.availability}</span>
                </div>
              )}

              {viewingVolunteer.message && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="font-bold text-stone-700 block mb-0.5">Motivation / Message:</span>
                  <p className="text-stone-700 leading-relaxed italic whitespace-pre-line">
                    &quot;{viewingVolunteer.message}&quot;
                  </p>
                </div>
              )}

              {/* Status Transition in Modal */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Change Application Status:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(viewingVolunteer.id, st, viewingVolunteer.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        (viewingVolunteer.status || 'New').toLowerCase() === st.toLowerCase()
                          ? 'bg-primary text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingVolunteer(null)}
                className="px-4 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Volunteer Record"
        message={`Are you sure you want to delete the registration for "${deleteTarget?.name}"?`}
        confirmText="Delete Record"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
