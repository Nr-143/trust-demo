import { useState, useMemo } from 'react';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import {
  createProgramme,
  updateProgramme,
  deleteProgramme,
} from '../../services/supabaseService';
import {
  FolderKanban,
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Archive,
  CheckCircle,
  X,
  ExternalLink,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Trees,
  SunMedium,
  Sparkles,
  HeartPulse,
  Droplet,
  Waves,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ConfirmModal from '../../components/common/ConfirmModal';

const programmeFormSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  titleTamil: z.string().optional(),
  category: z.string().min(2, 'Category is required'),
  icon: z.string().default('GraduationCap'),
  imageUrl: z.string().min(1, 'Image URL is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
});

const PRESET_ICONS = [
  { id: 'GraduationCap', label: 'Education', icon: GraduationCap },
  { id: 'Briefcase', label: 'Livelihood & Women', icon: Briefcase },
  { id: 'ShieldCheck', label: 'Drug-Free & Sports', icon: ShieldCheck },
  { id: 'Trees', label: 'Environment & Energy', icon: Trees },
  { id: 'HeartPulse', label: 'Sanitation & Healthcare', icon: HeartPulse },
  { id: 'Waves', label: 'Water Management', icon: Waves },
];

const PRESET_IMAGES = [
  {
    name: 'Rural Classroom',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Vocational Training',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Clean Water Project',
    url: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Afforestation & Farm',
    url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Solar Panel Array',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Health Camp',
    url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80',
  },
];

export default function AdminProgrammes() {
  const { programmes } = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState(null);
  const [viewingProgramme, setViewingProgramme] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Create form
  const createForm = useForm({
    resolver: zodResolver(programmeFormSchema),
    defaultValues: {
      title: '',
      titleTamil: '',
      category: 'Education',
      icon: 'GraduationCap',
      imageUrl: PRESET_IMAGES[0].url,
      description: '',
      status: 'active',
    },
  });

  // Edit form
  const editForm = useForm({
    resolver: zodResolver(programmeFormSchema),
  });

  // Filter programmes
  const filteredProgrammes = useMemo(() => {
    return (programmes || []).filter((p) => {
      const matchesSearch =
        (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.titleTamil || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [programmes, searchQuery, filterStatus]);

  // Counts
  const counts = useMemo(() => {
    const list = programmes || [];
    return {
      all: list.length,
      active: list.filter((p) => p.status === 'active').length,
      draft: list.filter((p) => p.status === 'draft').length,
      archived: list.filter((p) => p.status === 'archived').length,
    };
  }, [programmes]);

  // Handlers
  const handleOpenEdit = (prog) => {
    setEditingProgramme(prog);
    editForm.reset({
      title: prog.title || '',
      titleTamil: prog.titleTamil || '',
      category: prog.category || '',
      icon: prog.icon || 'GraduationCap',
      imageUrl: prog.imageUrl || PRESET_IMAGES[0].url,
      description: prog.description || '',
      status: prog.status || 'active',
    });
  };

  const handleCreateSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        highlights: ['Community Engagement', 'Volunteer Participation', 'Sustainable Impact'],
      };
      const created = await createProgramme(payload);
      dispatch({
        type: 'ADD_PROGRAMME',
        payload: created,
      });
      showSuccess(`New programme "${data.title}" saved to database successfully!`, 'Created');
      setCreateModalOpen(false);
      createForm.reset();
    } catch (err) {
      showError(err.message || 'Failed to create programme in database', 'Error');
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      if (!editingProgramme) return;
      const updated = await updateProgramme(editingProgramme.id, {
        ...editingProgramme,
        ...data,
      });
      dispatch({
        type: 'UPDATE_PROGRAMME',
        payload: updated,
      });
      showSuccess(`Programme "${data.title}" updated in database!`, 'Updated');
      setEditingProgramme(null);
    } catch (err) {
      showError(err.message || 'Failed to update programme in database', 'Error');
    }
  };

  const handleTogglePublish = async (prog) => {
    try {
      const newStatus = prog.status === 'active' ? 'draft' : 'active';
      const updated = await updateProgramme(prog.id, { ...prog, status: newStatus });
      dispatch({
        type: 'UPDATE_PROGRAMME',
        payload: updated,
      });
      showSuccess(
        newStatus === 'active'
          ? `"${prog.title}" is now Published & Active on public site.`
          : `"${prog.title}" has been set to Draft (Unpublished).`,
        newStatus === 'active' ? 'Published' : 'Unpublished'
      );
    } catch (err) {
      showError(err.message || 'Failed to change status in database');
    }
  };

  const handleToggleArchive = async (prog) => {
    try {
      const newStatus = prog.status === 'archived' ? 'active' : 'archived';
      const updated = await updateProgramme(prog.id, { ...prog, status: newStatus });
      dispatch({
        type: 'UPDATE_PROGRAMME',
        payload: updated,
      });
      showSuccess(
        newStatus === 'active'
          ? `"${prog.title}" has been restored to Active.`
          : `"${prog.title}" moved to Archived.`,
        newStatus === 'active' ? 'Restored' : 'Archived'
      );
    } catch (err) {
      showError(err.message || 'Failed to update archive status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProgramme(deleteTarget.id);
      dispatch({ type: 'DELETE_PROGRAMME', payload: deleteTarget.id });
      showSuccess(`Programme "${deleteTarget.title}" permanently deleted from database.`, 'Deleted');
      setDeleteTarget(null);
    } catch (err) {
      showError(err.message || 'Failed to delete programme from database');
    }
  };

  const inputClasses =
    'w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Verticals Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-primary-dark">Development Programmes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, edit, publish, or archive community service verticals across Dharmapuri.
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
          <span>New Programme</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Programmes', count: counts.all },
              { id: 'active', label: 'Active / Published', count: counts.active },
              { id: 'draft', label: 'Draft', count: counts.draft },
              { id: 'archived', label: 'Archived', count: counts.archived },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    filterStatus === tab.id ? 'bg-white/25 text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programmes..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Programmes Table */}
      {filteredProgrammes.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-2xs">
          <FolderKanban size={40} className="mx-auto text-stone-300 mb-3" />
          <h3 className="text-base font-bold text-stone-700">No programmes found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No records matching "${searchQuery}". Clear your search query or filter.`
              : 'No programmes exist under this category.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Programme Details</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProgrammes.map((prog) => {
                  return (
                    <tr key={prog.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={prog.imageUrl}
                            alt={prog.title}
                            className="h-12 w-12 rounded-xl object-cover shrink-0 border border-stone-200 bg-stone-100"
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0 max-w-md">
                            <p className="font-bold text-primary-dark truncate text-sm">
                              {prog.title}
                            </p>
                            {prog.titleTamil && (
                              <p className="text-xs text-emerald-800 font-tamil font-medium truncate">
                                {prog.titleTamil}
                              </p>
                            )}
                            <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                              {prog.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700">
                          {prog.category}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            prog.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : prog.status === 'draft'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              prog.status === 'active'
                                ? 'bg-emerald-600'
                                : prog.status === 'draft'
                                ? 'bg-amber-500'
                                : 'bg-stone-400'
                            }`}
                          />
                          <span className="capitalize">{prog.status}</span>
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Preview */}
                          <button
                            type="button"
                            onClick={() => setViewingProgramme(prog)}
                            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="Preview Programme Card"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prog)}
                            className="p-1.5 text-stone-500 hover:text-primary hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Programme Details"
                          >
                            <Edit size={16} />
                          </button>

                          {/* Publish/Unpublish toggle */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(prog)}
                            className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                              prog.status === 'active'
                                ? 'text-amber-700 hover:bg-amber-50 border border-amber-200'
                                : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                            }`}
                            title={prog.status === 'active' ? 'Set to Draft' : 'Publish to Live Site'}
                          >
                            {prog.status === 'active' ? 'Unpublish' : 'Publish'}
                          </button>

                          {/* Archive toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleArchive(prog)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title={prog.status === 'archived' ? 'Restore Programme' : 'Archive Programme'}
                          >
                            <Archive size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(prog)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Programme"
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

      {/* CREATE PROGRAMME MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-primary-dark">Create Development Programme</h3>
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
                  Programme Title (English) *
                </label>
                <input
                  {...createForm.register('title')}
                  className={inputClasses}
                  placeholder="e.g. Village Youth Vocational Center"
                />
                {createForm.formState.errors.title && (
                  <p className="text-xs text-red-500 mt-1">
                    {createForm.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Programme Title (Tamil)
                </label>
                <input
                  {...createForm.register('titleTamil')}
                  className={`${inputClasses} font-tamil`}
                  placeholder="e.g. கிராம இளைஞர் திறன் பயிற்சி"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select {...createForm.register('category')} className={inputClasses}>
                    <option value="Education">Education</option>
                    <option value="Livelihood Development and Women Empowerment">Livelihood Development and Women Empowerment</option>
                    <option value="Drug-Free Communities and Sports Development">Drug-Free Communities and Sports Development</option>
                    <option value="Environmental Protection and Renewable Energy">Environmental Protection and Renewable Energy</option>
                    <option value="Sanitation and Healthcare">Sanitation and Healthcare</option>
                    <option value="Community Water Management">Community Water Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select {...createForm.register('status')} className={inputClasses}>
                    <option value="active">Active (Published)</option>
                    <option value="draft">Draft (Unpublished)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Short Description *
                </label>
                <textarea
                  {...createForm.register('description')}
                  rows={3}
                  className={inputClasses}
                  placeholder="Summarize the programme mission, beneficiaries, and ongoing village activities..."
                />
                {createForm.formState.errors.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {createForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Choose Photo Asset
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => createForm.setValue('imageUrl', img.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        createForm.watch('imageUrl') === img.url
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={img.name}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  {...createForm.register('imageUrl')}
                  className={inputClasses}
                  placeholder="Or enter custom image URL"
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
                  Create Programme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROGRAMME MODAL */}
      {editingProgramme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-primary-dark">Edit Programme Details</h3>
              <button
                onClick={() => setEditingProgramme(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Programme Title (English) *
                </label>
                <input {...editForm.register('title')} className={inputClasses} />
                {editForm.formState.errors.title && (
                  <p className="text-xs text-red-500 mt-1">
                    {editForm.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Programme Title (Tamil)
                </label>
                <input {...editForm.register('titleTamil')} className={`${inputClasses} font-tamil`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select {...editForm.register('category')} className={inputClasses}>
                    <option value="Education">Education</option>
                    <option value="Livelihood Development and Women Empowerment">Livelihood Development and Women Empowerment</option>
                    <option value="Drug-Free Communities and Sports Development">Drug-Free Communities and Sports Development</option>
                    <option value="Environmental Protection and Renewable Energy">Environmental Protection and Renewable Energy</option>
                    <option value="Sanitation and Healthcare">Sanitation and Healthcare</option>
                    <option value="Community Water Management">Community Water Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select {...editForm.register('status')} className={inputClasses}>
                    <option value="active">Active (Published)</option>
                    <option value="draft">Draft (Unpublished)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Short Description *
                </label>
                <textarea {...editForm.register('description')} rows={3} className={inputClasses} />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Image Source
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => editForm.setValue('imageUrl', img.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        editForm.watch('imageUrl') === img.url
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input {...editForm.register('imageUrl')} className={inputClasses} />
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingProgramme(null)}
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

      {/* VIEW / PREVIEW MODAL */}
      {viewingProgramme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200">
            <div className="relative h-48 bg-stone-100">
              <img
                src={viewingProgramme.imageUrl}
                alt={viewingProgramme.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setViewingProgramme(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-bold bg-white text-primary-dark rounded-lg shadow-xs">
                  {viewingProgramme.category}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold bg-[#173B2A] text-white rounded-lg uppercase tracking-wider">
                  {viewingProgramme.status}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-primary-dark">{viewingProgramme.title}</h3>
              {viewingProgramme.titleTamil && (
                <p className="text-sm font-semibold text-emerald-800 font-tamil mt-0.5">
                  {viewingProgramme.titleTamil}
                </p>
              )}
              <p className="text-sm text-stone-600 mt-3 leading-relaxed">
                {viewingProgramme.description}
              </p>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-400">
                  ID: <code className="text-stone-600">{viewingProgramme.id}</code>
                </span>
                <button
                  type="button"
                  onClick={() => setViewingProgramme(null)}
                  className="px-4 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Programme"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This record will be permanently removed from the Supabase database.`}
        confirmText="Delete Programme"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
