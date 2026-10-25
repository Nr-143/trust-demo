import { useState, useMemo } from 'react';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import {
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadGalleryMedia,
} from '../../services/supabaseService';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Edit,
  Trash2,
  Archive,
  CheckCircle,
  X,
  Upload,
  Eye,
} from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

const PRESET_GALLERY_ASSETS = [
  { label: 'NGO Emblem Logo', url: '/images/originalLogo.jpeg' },
  { label: 'NGO Banner Logo', url: '/images/originalLogo.jpeg' },
  {
    label: 'Rural School Classroom',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Village Sapling Drive',
    url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Borewell & Safe Water',
    url: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Solar Village Streetlight',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
  },
];

export default function AdminGallery() {
  const { gallery } = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  // Form states for create
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Events');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('published');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form states for edit
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editStatus, setEditStatus] = useState('published');

  const categories = useMemo(() => {
    const set = new Set(['Events', 'Education', 'Environment', 'Water', 'Community']);
    (gallery || []).forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [gallery]);

  const filteredItems = useMemo(() => {
    return (gallery || []).filter((item) => {
      const matchesSearch =
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [gallery, searchQuery, selectedCategory, statusFilter]);

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditCategory(item.category || 'Events');
    setEditImageUrl(item.imageUrl || '');
    setEditStatus(item.status || 'published');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showError('Please provide an image caption or title');
      return;
    }

    let finalUrl = imageUrl.trim();

    try {
      setUploading(true);

      if (selectedFile) {
        const uploaded = await uploadGalleryMedia(selectedFile);
        finalUrl = uploaded.publicUrl;
      }

      if (!finalUrl) {
        showError('Please enter an image URL or choose a file to upload');
        setUploading(false);
        return;
      }

      const created = await createGalleryItem({
        title,
        category,
        imageUrl: finalUrl,
        status,
      });

      dispatch({
        type: 'ADD_GALLERY_ITEM',
        payload: created,
      });

      showSuccess(`Photo "${title}" saved to Supabase gallery!`, 'Saved');
      setTitle('');
      setImageUrl('');
      setSelectedFile(null);
      setCreateModalOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to save image to gallery');
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      showError('Please enter an image caption');
      return;
    }

    try {
      if (!editingItem) return;
      const updated = await updateGalleryItem(editingItem.id, {
        ...editingItem,
        title: editTitle,
        category: editCategory,
        imageUrl: editImageUrl,
        status: editStatus,
      });

      dispatch({
        type: 'UPDATE_GALLERY_ITEM',
        payload: updated,
      });

      showSuccess(`Photo caption & status updated in database!`, 'Updated');
      setEditingItem(null);
    } catch (err) {
      showError(err.message || 'Failed to update photo in database');
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const nextStatus = item.status === 'published' ? 'archived' : 'published';
      const updated = await updateGalleryItem(item.id, { ...item, status: nextStatus });

      dispatch({
        type: 'UPDATE_GALLERY_ITEM',
        payload: updated,
      });

      showSuccess(
        nextStatus === 'published'
          ? `"${item.title}" published to public gallery.`
          : `"${item.title}" moved to archived.`,
        nextStatus === 'published' ? 'Published' : 'Archived'
      );
    } catch (err) {
      showError(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGalleryItem(deleteTarget.id);
      dispatch({ type: 'DELETE_GALLERY_ITEM', payload: deleteTarget.id });
      showSuccess(`Image "${deleteTarget.title || 'Selected'}" permanently deleted from database.`, 'Deleted');
      setDeleteTarget(null);
    } catch (err) {
      showError(err.message || 'Failed to remove image from database');
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
              Media Assets & Field Photos
            </span>
          </div>
          <h1 className="text-2xl font-bold text-primary-dark">Photo Gallery Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage captions, categories, and publication visibility for photos across public pages.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Photo</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search captions..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 text-xs text-stone-500">
          <span className="font-semibold">Visibility:</span>
          {['all', 'published', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-stone-200 text-stone-900 font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              {st}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-stone-400">
            Showing {filteredItems.length} of {gallery?.length || 0} images
          </span>
        </div>
      </div>

      {/* Photo Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-2xs">
          <ImageIcon size={40} className="mx-auto text-stone-300 mb-3" />
          <h3 className="text-base font-bold text-stone-700">No photos found</h3>
          <p className="text-xs text-stone-500 mt-1">Try adjusting your search query or add a new photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs group flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/images/originalLogo.jpeg';
                  }}
                />

                {/* Status Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'published'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-800 text-white shadow-xs'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Category Pill */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-white/90 text-stone-800 backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Caption & Actions */}
              <div className="p-3.5 flex flex-col flex-1 justify-between">
                <div>
                  <p className="text-xs font-bold text-primary-dark line-clamp-2">{item.title}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item)}
                    className={`text-[11px] font-semibold hover:underline cursor-pointer ${
                      item.status === 'published' ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {item.status === 'published' ? 'Archive' : 'Publish'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                      title="View preview"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 text-stone-400 hover:text-primary hover:bg-stone-100 rounded transition-colors cursor-pointer"
                      title="Edit photo details"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Delete photo"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PHOTO MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-primary-dark">Add Photo to Gallery</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Caption / Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClasses}
                  placeholder="e.g. Village Free Medical Camp & Checkup"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={inputClasses}
                  >
                    <option value="Events">Events</option>
                    <option value="Education">Education</option>
                    <option value="Environment">Environment</option>
                    <option value="Water">Water Initiatives</option>
                    <option value="Community">Community Gathering</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Visibility Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={inputClasses}
                  >
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Choose from local presets */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Preset Local Assets
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                  {PRESET_GALLERY_ASSETS.map((asset) => (
                    <button
                      key={asset.label}
                      type="button"
                      onClick={() => setImageUrl(asset.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        imageUrl === asset.url
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={asset.label}
                    >
                      <img src={asset.url} alt={asset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* URL input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Or Enter Image Web URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className={inputClasses}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Local File Upload */}
              <div className="p-3 bg-stone-50 border border-dashed border-stone-300 rounded-xl">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Or Upload Local File to Supabase Storage
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Uploads securely to the Supabase Storage 'gallery-media' bucket.
                </p>
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
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploading ? 'Processing...' : 'Add Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PHOTO MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-primary-dark">Edit Photo Information</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Caption / Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className={inputClasses}
                  >
                    <option value="Events">Events</option>
                    <option value="Education">Education</option>
                    <option value="Environment">Environment</option>
                    <option value="Water">Water Initiatives</option>
                    <option value="Community">Community Gathering</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Visibility
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className={inputClasses}
                  >
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Image Source URL
                </label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200">
            <div className="relative aspect-16/10 bg-black">
              <img
                src={previewItem.imageUrl}
                alt={previewItem.title}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                  {previewItem.category}
                </span>
                <p className="text-sm font-bold text-primary-dark mt-0.5">{previewItem.title}</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-stone-100 text-stone-700 uppercase">
                {previewItem.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Remove Photo"
        message={`Are you sure you want to remove photo "${deleteTarget?.title || 'Selected'}"?`}
        confirmText="Remove Photo"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
