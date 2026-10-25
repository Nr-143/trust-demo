import { useState, useMemo, useEffect } from 'react';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import {
  Briefcase,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  MapPin,
  Calendar,
  CheckCircle,
  Eye,
  FileText,
  Phone,
  Mail,
  Award,
  Archive,
  RefreshCw,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDate } from '../../utils/helpers';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import {
  createCareer,
  updateCareer,
  deleteCareer,
} from '../../services/supabaseService';

const careerFormSchema = z.object({
  title: z.string().min(3, 'Position title is required'),
  location: z.string().min(2, 'Location is required'),
  type: z.string().default('Full-time'),
  description: z.string().min(10, 'Job description must be at least 10 characters'),
  skills: z.string().optional().default('Relevant field experience or degree'),
  status: z.enum(['open', 'closed', 'draft', 'archived']).default('open'),
  publicationStatus: z.enum(['published', 'draft', 'archived']).default('published'),
});

const JOB_APP_STATUS_OPTIONS = ['New', 'Reviewed', 'Contacted', 'Shortlisted', 'Rejected'];

export default function AdminCareers() {
  const { careers, jobApplications } = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'applications'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cloudApplications, setCloudApplications] = useState(null);
  const [loadingApps, setLoadingApps] = useState(false);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState(null);
  const [viewingCareer, setViewingCareer] = useState(null);
  const [viewingApplication, setViewingApplication] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchApplications = async () => {
    if (isSupabaseConfigured() && supabase) {
      setLoadingApps(true);
      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select('*')
          .order('submitted_at', { ascending: false });

        if (error) throw error;
        const normalized = (data || []).map((item) => ({
          ...item,
          careerTitle: item.career_title || item.careerTitle,
          careerId: item.career_id || item.careerId,
          submittedAt: item.submitted_at || item.created_at,
        }));
        setCloudApplications(normalized);
      } catch (err) {
        console.error('Failed to load applications from Supabase:', err);
      } finally {
        setLoadingApps(false);
      }
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const rawApplications =
    cloudApplications !== null ? cloudApplications : (jobApplications || []);

  // Forms
  const createForm = useForm({
    resolver: zodResolver(careerFormSchema),
    defaultValues: {
      title: '',
      location: 'Palacode / Dharmapuri, Tamil Nadu',
      type: 'Full-time',
      description: '',
      skills: 'Degree in Social Work, Agriculture, or relevant field experience',
      status: 'open',
      publicationStatus: 'published',
    },
  });

  const editForm = useForm({
    resolver: zodResolver(careerFormSchema),
  });

  const filteredCareers = useMemo(() => {
    return (careers || []).filter((c) => {
      const matchesSearch =
        (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        c.status === statusFilter ||
        c.publicationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [careers, searchQuery, statusFilter]);

  const filteredApplications = useMemo(() => {
    return rawApplications.filter((app) => {
      const matchesSearch =
        (app.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.careerTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.skills || '').toLowerCase().includes(searchQuery.toLowerCase());

      const status = app.status || 'New';
      const matchesStatus =
        statusFilter === 'all' ||
        status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [rawApplications, searchQuery, statusFilter]);

  const handleOpenEdit = (career) => {
    setEditingCareer(career);
    editForm.reset({
      title: career.title || '',
      location: career.location || '',
      type: career.type || 'Full-time',
      description: career.description || '',
      skills: career.skills || '',
      status: career.status || 'open',
      publicationStatus: career.publicationStatus || 'published',
    });
  };

  const handleCreateSubmit = async (data) => {
    try {
      const created = await createCareer(data);
      dispatch({
        type: 'ADD_CAREER',
        payload: created,
      });
      showSuccess(`Career opportunity "${data.title}" saved to database!`, 'Posted');
      setCreateModalOpen(false);
      createForm.reset();
    } catch (err) {
      showError(err.message || 'Failed to save career position to database');
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      if (!editingCareer) return;
      const updated = await updateCareer(editingCareer.id, {
        ...editingCareer,
        ...data,
      });
      dispatch({
        type: 'UPDATE_CAREER',
        payload: updated,
      });
      showSuccess(`Position "${data.title}" updated in database!`, 'Updated');
      setEditingCareer(null);
    } catch (err) {
      showError(err.message || 'Failed to update position in database');
    }
  };

  const handleTogglePublish = async (career) => {
    try {
      const isPub =
        career.publicationStatus === 'published' ||
        (!career.publicationStatus && career.status === 'open');

      const nextPub = isPub ? 'draft' : 'published';
      const nextStatus = isPub ? 'draft' : 'open';

      const updated = await updateCareer(career.id, {
        ...career,
        publicationStatus: nextPub,
        status: nextStatus,
      });

      dispatch({
        type: 'UPDATE_CAREER',
        payload: updated,
      });

      showSuccess(
        isPub ? `"${career.title}" unlisted and set to Draft.` : `"${career.title}" published to public careers page.`,
        isPub ? 'Unpublished' : 'Published'
      );
    } catch (err) {
      showError(err.message || 'Failed to update status in database');
    }
  };

  const handleArchiveCareer = async (career) => {
    try {
      const isArchived = career.status === 'archived';
      const updated = await updateCareer(career.id, {
        ...career,
        status: isArchived ? 'open' : 'archived',
        publicationStatus: isArchived ? 'published' : 'archived',
      });

      dispatch({
        type: 'UPDATE_CAREER',
        payload: updated,
      });

      showSuccess(
        isArchived ? `"${career.title}" restored from archive.` : `"${career.title}" moved to archived.`,
        isArchived ? 'Restored' : 'Archived'
      );
    } catch (err) {
      showError(err.message || 'Failed to update archive status in database');
    }
  };

  const handleAppStatusChange = async (appId, newStatus, applicantName) => {
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('job_applications')
          .update({ status: newStatus })
          .eq('id', appId);
        if (error) throw error;
      }

      if (cloudApplications !== null) {
        setCloudApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
        );
      }

      dispatch({
        type: 'UPDATE_JOB_APPLICATION_STATUS',
        payload: { id: appId, status: newStatus },
      });
      showSuccess(`Application for ${applicantName} updated to "${newStatus}".`, 'Status Updated');
      if (viewingApplication && viewingApplication.id === appId) {
        setViewingApplication({ ...viewingApplication, status: newStatus });
      }
    } catch (err) {
      showError(err.message || 'Failed to update status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.isJobApplication) {
        if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase
            .from('job_applications')
            .delete()
            .eq('id', deleteTarget.id);
          if (error) throw error;
        }

        if (cloudApplications !== null) {
          setCloudApplications((prev) =>
            prev.filter((app) => app.id !== deleteTarget.id)
          );
        }

        dispatch({ type: 'DELETE_JOB_APPLICATION', payload: deleteTarget.id });
        showSuccess(`Job application for "${deleteTarget.name}" deleted.`, 'Deleted');
      } else {
        await deleteCareer(deleteTarget.id);
        dispatch({ type: 'DELETE_CAREER', payload: deleteTarget.id });
        showSuccess(`Position "${deleteTarget.title}" permanently deleted from database.`, 'Deleted');
      }
      setDeleteTarget(null);
    } catch (err) {
      showError(err.message || 'Failed to delete record');
    }
  };

  const inputClasses =
    'w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Talent & Field Recruitment
            </span>
          </div>
          <h1 className="text-2xl font-bold text-primary-dark">Career & Role Postings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage vacancies, publication visibility, and review candidate applications submitted from `/careers`.
          </p>
        </div>

        <button
          onClick={() => {
            createForm.reset();
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={16} />
          <span>New Position</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 mb-6">
        <button
          onClick={() => {
            setActiveTab('listings');
            setStatusFilter('all');
          }}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'border-primary text-primary-dark'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Briefcase size={14} />
          <span>Job Listings ({careers?.length || 0})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('applications');
            setStatusFilter('all');
          }}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'applications'
              ? 'border-primary text-primary-dark'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FileText size={14} />
          <span>Candidate Applications ({rawApplications?.length || 0})</span>
        </button>

        {activeTab === 'applications' && isSupabaseConfigured() && (
          <button
            onClick={fetchApplications}
            disabled={loadingApps}
            className="ml-auto mb-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={12} className={loadingApps ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* TAB 1: JOB LISTINGS */}
      {activeTab === 'listings' ? (
        <>
          {/* Filter and Search Bar */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-6 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['all', 'open', 'published', 'draft', 'archived'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-primary text-white shadow-2xs'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    {st === 'all' ? 'All Roles' : st}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listings..."
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {filteredCareers.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-2xs">
              <Briefcase size={40} className="mx-auto text-stone-300 mb-3" />
              <h3 className="text-base font-bold text-stone-700">No positions found</h3>
              <p className="text-xs text-stone-500 mt-1">Try clearing your search query or add a new job listing.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Position Title</th>
                      <th className="px-4 py-3.5">Location & Type</th>
                      <th className="px-4 py-3.5">Publication</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredCareers.map((c) => {
                      const isPub =
                        c.publicationStatus === 'published' ||
                        (!c.publicationStatus && c.status === 'open');

                      return (
                        <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-bold text-primary-dark text-sm">{c.title}</p>
                            <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{c.description}</p>
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-xs text-stone-600">
                            <div className="flex items-center gap-1.5 mb-1">
                              <MapPin size={13} className="text-stone-400" />
                              <span>{c.location}</span>
                            </div>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700">
                              {c.type}
                            </span>
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isPub
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isPub ? 'bg-emerald-600' : 'bg-amber-500'
                                }`}
                              />
                              <span>{isPub ? 'Published' : 'Draft'}</span>
                            </span>
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-xs text-stone-500">
                            <span className="capitalize font-medium">{c.status}</span>
                            <span className="block text-[10px] text-stone-400 mt-0.5">
                              Posted: {formatDate(c.postedDate)}
                            </span>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Preview */}
                              <button
                                type="button"
                                onClick={() => setViewingCareer(c)}
                                className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                title="Preview details"
                              >
                                <Eye size={16} />
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(c)}
                                className="p-1.5 text-stone-500 hover:text-primary hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit Position"
                              >
                                <Edit size={16} />
                              </button>

                              {/* Publish / Unpublish */}
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(c)}
                                className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                  isPub
                                    ? 'text-amber-700 hover:bg-amber-50 border border-amber-200'
                                    : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                                }`}
                              >
                                {isPub ? 'Unpublish' : 'Publish'}
                              </button>

                              {/* Archive */}
                              <button
                                type="button"
                                onClick={() => handleArchiveCareer(c)}
                                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                title={c.status === 'archived' ? 'Restore from Archive' : 'Archive Position'}
                              >
                                <Archive size={16} />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(c)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Position"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* TAB 2: CANDIDATE APPLICATIONS */
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['all', 'New', 'Reviewed', 'Contacted', 'Shortlisted', 'Rejected'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-primary text-white shadow-2xs'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applicants, roles..."
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-2xs">
              <FileText size={40} className="mx-auto text-stone-300 mb-3" />
              <h3 className="text-base font-bold text-stone-700">No applications found</h3>
              <p className="text-xs text-stone-500 mt-1">
                Candidate submissions from `/careers` will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Candidate</th>
                      <th className="px-4 py-3.5">Target Position</th>
                      <th className="px-4 py-3.5">Contact</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-primary-dark text-sm">{app.name}</p>
                          {app.experience && (
                            <p className="text-xs text-stone-500 mt-0.5 truncate max-w-xs">
                              {app.experience}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 text-xs font-semibold text-stone-800">
                          {app.careerTitle}
                          <span className="block text-[10px] text-stone-400 font-normal mt-0.5">
                            {formatDate(app.submittedAt)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-xs text-stone-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-stone-400" />
                            <span>{app.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Mail size={12} className="text-stone-400" />
                            <span>{app.email}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <select
                            value={app.status || 'New'}
                            onChange={(e) => handleAppStatusChange(app.id, e.target.value, app.name)}
                            className="text-xs font-semibold py-1 px-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none cursor-pointer"
                          >
                            {JOB_APP_STATUS_OPTIONS.map((st) => (
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
                              onClick={() => setViewingApplication(app)}
                              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                              title="View Application Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ ...app, isJobApplication: true })}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Application"
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
        </div>
      )}

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-primary-dark">Create Job Posting</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Position Title *
                </label>
                <input
                  {...createForm.register('title')}
                  className={inputClasses}
                  placeholder="e.g. Rural Education Field Coordinator"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Job Type *
                  </label>
                  <select {...createForm.register('type')} className={inputClasses}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Field Volunteer">Field Volunteer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Publication Status
                  </label>
                  <select {...createForm.register('publicationStatus')} className={inputClasses}>
                    <option value="published">Published (Visible Publicly)</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Location *
                </label>
                <input {...createForm.register('location')} className={inputClasses} />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Required Background / Skills
                </label>
                <input {...createForm.register('skills')} className={inputClasses} />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Job Description & Scope *
                </label>
                <textarea
                  {...createForm.register('description')}
                  rows={4}
                  className={inputClasses}
                  placeholder="Describe key responsibilities and village coordination scope..."
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Post Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingCareer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-primary-dark">Edit Career Listing</h3>
              <button
                onClick={() => setEditingCareer(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Position Title *
                </label>
                <input {...editForm.register('title')} className={inputClasses} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Job Type
                  </label>
                  <select {...editForm.register('type')} className={inputClasses}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Field Volunteer">Field Volunteer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Publication Status
                  </label>
                  <select {...editForm.register('publicationStatus')} className={inputClasses}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Location
                </label>
                <input {...editForm.register('location')} className={inputClasses} />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Skills & Qualifications
                </label>
                <input {...editForm.register('skills')} className={inputClasses} />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Job Description
                </label>
                <textarea {...editForm.register('description')} rows={4} className={inputClasses} />
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingCareer(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CAREER MODAL */}
      {viewingCareer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  {viewingCareer.type}
                </span>
                <h3 className="text-lg font-bold text-primary-dark mt-0.5">{viewingCareer.title}</h3>
                <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                  <MapPin size={13} />
                  <span>{viewingCareer.location}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingCareer(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <span className="font-bold text-stone-700 block mb-1">Description:</span>
                <p className="text-stone-600 leading-relaxed whitespace-pre-line">
                  {viewingCareer.description}
                </p>
              </div>

              {viewingCareer.skills && (
                <div>
                  <span className="font-bold text-stone-700 block mb-1">Required Skills:</span>
                  <p className="text-stone-600">{viewingCareer.skills}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Publication: <strong className="capitalize">{viewingCareer.publicationStatus || 'published'}</strong>
              </span>
              <button
                type="button"
                onClick={() => setViewingCareer(null)}
                className="px-4 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW APPLICATION MODAL */}
      {viewingApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  Sample Job Application
                </span>
                <h3 className="text-lg font-bold text-primary-dark mt-0.5">{viewingApplication.name}</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Applied for: <strong>{viewingApplication.careerTitle}</strong>
                </p>
              </div>
              <button
                onClick={() => setViewingApplication(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-stone-700">
                  <Phone size={13} className="text-stone-400" />
                  <span>{viewingApplication.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Mail size={13} className="text-stone-400" />
                  <span>{viewingApplication.email}</span>
                </div>
              </div>

              {viewingApplication.experience && (
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="font-bold text-stone-700 block mb-0.5">Background / Experience:</span>
                  <p className="text-stone-800">{viewingApplication.experience}</p>
                </div>
              )}

              {viewingApplication.skills && (
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="font-bold text-stone-700 block mb-0.5">Key Skills:</span>
                  <p className="text-stone-800">{viewingApplication.skills}</p>
                </div>
              )}

              {viewingApplication.message && (
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="font-bold text-stone-700 block mb-0.5">Cover Note:</span>
                  <p className="text-stone-700 italic whitespace-pre-line">&quot;{viewingApplication.message}&quot;</p>
                </div>
              )}

              <div className="pt-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Update Candidate Status:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {JOB_APP_STATUS_OPTIONS.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleAppStatusChange(viewingApplication.id, st, viewingApplication.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        viewingApplication.status === st
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
                onClick={() => setViewingApplication(null)}
                className="px-4 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition-colors cursor-pointer"
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
        title={deleteTarget?.isJobApplication ? 'Delete Application' : 'Delete Position'}
        message={`Are you sure you want to delete ${deleteTarget?.name || deleteTarget?.title}?`}
        confirmText="Delete Record"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
