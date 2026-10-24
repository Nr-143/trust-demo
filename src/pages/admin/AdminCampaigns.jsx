import { useState, useMemo } from 'react';
import { useSite, useSiteDispatch, useDonationModal } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import {
  Megaphone,
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Archive,
  Heart,
  Calendar,
  X,
  Sparkles,
  ExternalLink,
  Globe,
  CheckCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ConfirmModal from '../../components/common/ConfirmModal';

const campaignFormSchema = z.object({
  title: z.string().min(3, 'Campaign title is required'),
  slug: z.string().optional(),
  category: z.string().min(2, 'Category is required'),
  description: z.string().min(10, 'Short description must be at least 10 characters'),
  fullDescription: z.string().optional(),
  goalAmount: z.coerce.number().positive('Goal amount must be greater than zero'),
  raisedAmount: z.coerce.number().min(0, 'Raised amount cannot be negative').default(0),
  donorsCount: z.coerce.number().int().min(0).default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  imageUrl: z.string().min(1, 'Image URL or asset path is required'),
  status: z.enum(['active', 'completed', 'archived']).default('active'),
  publicationStatus: z.enum(['published', 'draft', 'archived']).default('published'),
  location: z.string().optional(),
});

// Assets available locally and rural presets
const ASSET_PRESETS = [
  { name: 'Water Well & Tank', url: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&auto=format&fit=crop&q=80' },
  { name: 'Village Education', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80' },
  { name: 'Tree Plantation', url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop&q=80' },
  { name: 'Solar Panels', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80' },
  { name: 'Community Medical', url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80' },
  { name: 'NGO Emblem Logo', url: '/images/logo-badge.jpeg' },
  { name: 'NGO Full Banner', url: '/images/logo-full.jpeg' },
];

export default function AdminCampaigns() {
  const { campaigns, demoDonations } = useSite();
  const dispatch = useSiteDispatch();
  const { openDonationModal } = useDonationModal();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'donations'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [viewingCampaign, setViewingCampaign] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Forms
  const createForm = useForm({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      category: 'Clean Water',
      description: '',
      fullDescription: '',
      goalAmount: 250000,
      raisedAmount: 0,
      donorsCount: 0,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '2027-03-31',
      imageUrl: ASSET_PRESETS[0].url,
      status: 'active',
      publicationStatus: 'published',
      location: 'Dharmapuri Rural Taluks',
    },
  });

  const editForm = useForm({
    resolver: zodResolver(campaignFormSchema),
  });

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return (campaigns || []).filter((c) => {
      const matchesSearch =
        (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        c.status === statusFilter ||
        c.publicationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  // Aggregate metrics
  const totalGoal = (campaigns || []).reduce((sum, c) => sum + (Number(c.goalAmount) || 0), 0);
  const totalRaised = (campaigns || []).reduce((sum, c) => sum + (Number(c.raisedAmount) || 0), 0);
  const overallPercent = totalGoal > 0 ? Math.min(100, Math.round((totalRaised / totalGoal) * 100)) : 0;
  const totalDonors = (campaigns || []).reduce((sum, c) => sum + (Number(c.donorsCount) || 0), 0);

  // Handlers
  const handleOpenEdit = (campaign) => {
    setEditingCampaign(campaign);
    editForm.reset({
      title: campaign.title || '',
      slug: campaign.slug || '',
      category: campaign.category || 'Rural Cause',
      description: campaign.shortDescription || campaign.description || '',
      fullDescription: campaign.fullDescription || campaign.description || '',
      goalAmount: campaign.goalAmount || 100000,
      raisedAmount: campaign.raisedAmount || 0,
      donorsCount: campaign.donorsCount || 0,
      startDate: campaign.startDate || '2026-01-01',
      endDate: campaign.endDate || '2027-03-31',
      imageUrl: campaign.imageUrl || ASSET_PRESETS[0].url,
      status: campaign.status || 'active',
      publicationStatus: campaign.publicationStatus || 'published',
      location: campaign.location || 'Palacode Taluk',
    });
  };

  const handleCreateSubmit = (data) => {
    try {
      dispatch({
        type: 'ADD_CAMPAIGN',
        payload: {
          ...data,
          isDemo: false,
        },
      });
      showSuccess(`Campaign "${data.title}" created successfully!`, 'Created');
      setCreateModalOpen(false);
      createForm.reset();
    } catch (err) {
      showError(err.message || 'Failed to create campaign', 'Error');
    }
  };

  const handleEditSubmit = (data) => {
    try {
      if (!editingCampaign) return;
      dispatch({
        type: 'UPDATE_CAMPAIGN',
        payload: {
          id: editingCampaign.id,
          ...editingCampaign,
          ...data,
        },
      });
      showSuccess(`Campaign "${data.title}" updated successfully!`, 'Updated');
      setEditingCampaign(null);
    } catch (err) {
      showError(err.message || 'Failed to update campaign', 'Error');
    }
  };

  const handleTogglePublish = (camp) => {
    try {
      const isCurrentlyPublished =
        camp.publicationStatus === 'published' ||
        (!camp.publicationStatus && camp.status === 'active');

      if (isCurrentlyPublished) {
        dispatch({
          type: 'UPDATE_CAMPAIGN',
          payload: { id: camp.id, publicationStatus: 'draft' },
        });
        showSuccess(`"${camp.title}" unlisted and set to Draft.`, 'Unpublished');
      } else {
        dispatch({
          type: 'UPDATE_CAMPAIGN',
          payload: { id: camp.id, publicationStatus: 'published', status: 'active' },
        });
        showSuccess(`"${camp.title}" published to public listings.`, 'Published');
      }
    } catch (err) {
      showError(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    try {
      dispatch({ type: 'DELETE_CAMPAIGN', payload: deleteTarget.id });
      showSuccess(`Campaign "${deleteTarget.title}" deleted from LocalStorage.`, 'Deleted');
      setDeleteTarget(null);
    } catch (err) {
      showError(err.message || 'Failed to delete campaign');
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
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Fundraising Demonstration Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-primary-dark">Fundraising Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure target amounts, simulated funds raised, URL slugs, publication status, and descriptions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              createForm.reset();
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Target</p>
          <p className="text-xl font-extrabold text-primary-dark mt-1">{formatCurrency(totalGoal)}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">{campaigns.length} total initiatives</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Demo Raised</p>
          <p className="text-xl font-extrabold text-[#176B36] mt-1">{formatCurrency(totalRaised)}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{overallPercent}% of total goal</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Simulated Pledges</p>
          <p className="text-xl font-extrabold text-amber-600 mt-1">{totalDonors}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">Test supporter records</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Quick Action</p>
          <button
            onClick={() => openDonationModal()}
            className="mt-1.5 w-full py-1.5 px-3 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Heart size={14} className="text-amber-600 fill-amber-600" />
            <span>Simulate Donation</span>
          </button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 mb-6">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'campaigns'
              ? 'border-primary text-primary-dark'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Megaphone size={14} />
          <span>Active Campaigns ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'donations'
              ? 'border-primary text-primary-dark'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Heart size={14} />
          <span>Donation Activity Log ({demoDonations?.length || 0})</span>
        </button>
      </div>

      {activeTab === 'campaigns' ? (
        <>
          {/* Filter Bar */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-6 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['all', 'active', 'published', 'draft', 'archived'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer ${
                      statusFilter === status
                        ? 'bg-primary text-white shadow-2xs'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns or slugs..."
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Campaigns Table */}
          {filteredCampaigns.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-2xs">
              <Megaphone size={40} className="mx-auto text-stone-300 mb-3" />
              <h3 className="text-base font-bold text-stone-700">No campaigns found</h3>
              <p className="text-xs text-stone-500 mt-1">
                Try clearing search filter or launch a new campaign.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Campaign & Slug</th>
                      <th className="px-4 py-3.5">Progress & Target</th>
                      <th className="px-4 py-3.5">Publication</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredCampaigns.map((camp) => {
                      const goal = Number(camp.goalAmount) || 0;
                      const raised = Number(camp.raisedAmount) || 0;
                      const rawPct = goal > 0 ? Math.round((raised / goal) * 100) : 0;
                      const pct = Math.min(100, rawPct);
                      const isExceeded = raised > goal;
                      const isPub =
                        camp.publicationStatus === 'published' ||
                        (!camp.publicationStatus && camp.status === 'active');

                      const publicUrl = `/campaigns/${camp.slug || camp.id}`;

                      return (
                        <tr key={camp.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3.5">
                              <img
                                src={camp.imageUrl}
                                alt={camp.title}
                                className="h-12 w-12 rounded-xl object-cover shrink-0 border border-stone-200 bg-stone-100"
                              />
                              <div className="min-w-0 max-w-sm">
                                <p className="font-bold text-primary-dark truncate text-sm">
                                  {camp.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600">
                                    {camp.category}
                                  </span>
                                  {camp.slug && (
                                    <span className="text-[10px] font-mono text-stone-400 truncate">
                                      /{camp.slug}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 min-w-[200px]">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-primary-dark">
                                  {formatCurrency(raised)}
                                </span>
                                <span className="text-stone-500">of {formatCurrency(goal)}</span>
                              </div>
                              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isExceeded
                                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                                      : 'bg-primary'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-stone-500">
                                <span>{rawPct}% funded</span>
                                <span>{camp.donorsCount || 0} supporters</span>
                              </div>
                            </div>
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

                          <td className="px-4 py-4 whitespace-nowrap text-xs text-stone-600">
                            <span className="capitalize font-medium">{camp.status}</span>
                            {camp.endDate && (
                              <span className="block text-[10px] text-stone-400 mt-0.5">
                                End: {camp.endDate}
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Open Public Page */}
                              <a
                                href={publicUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                title="Open Live Campaign Detail Page"
                              >
                                <ExternalLink size={15} />
                              </a>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(camp)}
                                className="p-1.5 text-stone-500 hover:text-primary hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit Campaign"
                              >
                                <Edit size={16} />
                              </button>

                              {/* Publish / Unpublish */}
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(camp)}
                                className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                  isPub
                                    ? 'text-amber-700 hover:bg-amber-50 border border-amber-200'
                                    : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                                }`}
                              >
                                {isPub ? 'Unpublish' : 'Publish'}
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(camp)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Campaign"
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
        /* Donations Tab */
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Simulated Donor Transactions Log
            </h3>
            <span className="text-xs text-stone-500">
              {demoDonations?.length || 0} demo records saved in LocalStorage
            </span>
          </div>

          {!demoDonations || demoDonations.length === 0 ? (
            <div className="p-10 text-center text-xs text-stone-500">
              No demo pledges recorded yet. Click &quot;Simulate Donation&quot; to test.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50/50 border-b border-stone-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Supporter Name</th>
                    <th className="px-4 py-3">Campaign Pledged</th>
                    <th className="px-4 py-3">Demo Amount</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {demoDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-stone-50/50">
                      <td className="px-5 py-3 font-semibold text-primary-dark">
                        {d.donorName}
                        <span className="block text-[11px] text-stone-400 font-normal">{d.donorEmail}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-700">{d.campaignTitle}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        {formatCurrency(d.amount)}
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-400">
                        {formatDate(d.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-primary-dark">Create Fundraising Campaign</h3>
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
                  Campaign Title *
                </label>
                <input
                  {...createForm.register('title')}
                  className={inputClasses}
                  placeholder="e.g. Clean Drinking Water for Eruthukuttahalli"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    URL Slug (Optional, auto-generated if blank)
                  </label>
                  <input
                    {...createForm.register('slug')}
                    className={inputClasses}
                    placeholder="e.g. clean-drinking-water-eruthukuttahalli"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Cause Category *
                  </label>
                  <select {...createForm.register('category')} className={inputClasses}>
                    <option value="Clean Water">Clean Drinking Water</option>
                    <option value="Education">Education Support</option>
                    <option value="Environment">Green Villages & Afforestation</option>
                    <option value="Renewable Energy">Solar Village Lighting</option>
                    <option value="Healthcare">Rural Health Camps</option>
                    <option value="Community Infrastructure">Community Infrastructure</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Fundraising Target (₹ INR) *
                  </label>
                  <input
                    type="number"
                    {...createForm.register('goalAmount', { valueAsNumber: true })}
                    className={inputClasses}
                    placeholder="250000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Demonstration Raised (₹ INR)
                  </label>
                  <input
                    type="number"
                    {...createForm.register('raisedAmount', { valueAsNumber: true })}
                    className={inputClasses}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Publication Status
                  </label>
                  <select {...createForm.register('publicationStatus')} className={inputClasses}>
                    <option value="published">Published (Visible Publicly)</option>
                    <option value="draft">Draft (Admin Only)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Demonstration Deadline Date
                  </label>
                  <input
                    type="date"
                    {...createForm.register('endDate')}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Short Description (Card Summary) *
                </label>
                <textarea
                  {...createForm.register('description')}
                  rows={2}
                  className={inputClasses}
                  placeholder="Summary shown on campaign listings..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Project Description (Detail Page Narrative)
                </label>
                <textarea
                  {...createForm.register('fullDescription')}
                  rows={4}
                  className={inputClasses}
                  placeholder="In-depth project background, problem statement, community impact, and execution plan..."
                />
              </div>

              {/* Asset Presets */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Select Local Asset or Cause Photo
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-2">
                  {ASSET_PRESETS.map((asset) => (
                    <button
                      key={asset.name}
                      type="button"
                      onClick={() => createForm.setValue('imageUrl', asset.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        createForm.watch('imageUrl') === asset.url
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={asset.name}
                    >
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  {...createForm.register('imageUrl')}
                  className={inputClasses}
                  placeholder="Asset URL (e.g. /images/logo-badge.jpeg or web URL)"
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
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CAMPAIGN MODAL */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-primary-dark">Edit Campaign Configuration</h3>
              <button
                onClick={() => setEditingCampaign(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Campaign Title *
                </label>
                <input {...editForm.register('title')} className={inputClasses} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    URL Slug
                  </label>
                  <input {...editForm.register('slug')} className={inputClasses} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Cause Category *
                  </label>
                  <select {...editForm.register('category')} className={inputClasses}>
                    <option value="Clean Water">Clean Drinking Water</option>
                    <option value="Education">Education Support</option>
                    <option value="Environment">Green Villages & Afforestation</option>
                    <option value="Renewable Energy">Solar Village Lighting</option>
                    <option value="Healthcare">Rural Health Camps</option>
                    <option value="Community Infrastructure">Community Infrastructure</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Fundraising Target (₹)
                  </label>
                  <input
                    type="number"
                    {...editForm.register('goalAmount', { valueAsNumber: true })}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Demo Raised (₹)
                  </label>
                  <input
                    type="number"
                    {...editForm.register('raisedAmount', { valueAsNumber: true })}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Publication
                  </label>
                  <select {...editForm.register('publicationStatus')} className={inputClasses}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input type="date" {...editForm.register('startDate')} className={inputClasses} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input type="date" {...editForm.register('endDate')} className={inputClasses} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Short Summary *
                </label>
                <textarea {...editForm.register('description')} rows={2} className={inputClasses} />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Description (Detail Page)
                </label>
                <textarea {...editForm.register('fullDescription')} rows={4} className={inputClasses} />
              </div>

              {/* Asset selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Select Local Asset or Cause Photo
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-2">
                  {ASSET_PRESETS.map((asset) => (
                    <button
                      key={asset.name}
                      type="button"
                      onClick={() => editForm.setValue('imageUrl', asset.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        editForm.watch('imageUrl') === asset.url
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={asset.name}
                    >
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input {...editForm.register('imageUrl')} className={inputClasses} />
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Campaign"
        message={`Are you sure you want to delete campaign "${deleteTarget?.title}"? All pledge associations will also be removed.`}
        confirmText="Delete Campaign"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
