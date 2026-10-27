import { useState, useMemo, useEffect, useRef } from 'react';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import {
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  deleteCloudinaryMedia,
  uploadGalleryMedia,
} from '../../services/supabaseService';
import { getGalleryMediaType } from '../../services/mediaProcessing';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
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
  const [selectedFilePreview, setSelectedFilePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFilePreview('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setSelectedFilePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedFile]);

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

  const clearSelectedMedia = () => {
    setImageUrl('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    clearSelectedMedia();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showError('Please provide an image caption or title');
      return;
    }

    let finalUrl = imageUrl.trim();

    let uploadedMedia = null;
    try {
      setUploading(true);

      if (selectedFile) {
        uploadedMedia = await uploadGalleryMedia(selectedFile);
        finalUrl = uploadedMedia.publicUrl;
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
        mediaType: uploadedMedia?.mediaType || 'image',
        cloudinaryPublicId: uploadedMedia?.publicId,
        status,
      });

      dispatch({
        type: 'ADD_GALLERY_ITEM',
        payload: created,
      });

      showSuccess(`Media "${title}" saved to the gallery.`, 'Saved');
      setTitle('');
      clearSelectedMedia();
      setCreateModalOpen(false);
    } catch (err) {
      let message = err.message || 'Failed to save media to gallery';
      if (uploadedMedia?.publicId) {
        try {
          await deleteCloudinaryMedia(uploadedMedia.publicId, uploadedMedia.mediaType);
        } catch (cleanupError) {
          message += ` Cleanup also failed: ${cleanupError.message}`;
        }
      }
      showError(message);
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
      const replacingMedia = editImageUrl.trim() !== editingItem.imageUrl;
      const updated = await updateGalleryItem(editingItem.id, {
        ...editingItem,
        title: editTitle,
        category: editCategory,
        imageUrl: editImageUrl.trim(),
        mediaType: replacingMedia ? 'image' : editingItem.mediaType || 'image',
        cloudinaryPublicId: replacingMedia ? null : editingItem.cloudinaryPublicId,
        status: editStatus,
      });

      dispatch({
        type: 'UPDATE_GALLERY_ITEM',
        payload: updated,
      });

      setEditingItem(null);
      if (replacingMedia && editingItem.cloudinaryPublicId) {
        try {
          await deleteCloudinaryMedia(editingItem.cloudinaryPublicId, editingItem.mediaType || 'image');
        } catch (cleanupError) {
          showError(`Gallery updated, but the previous Cloudinary file could not be removed: ${cleanupError.message}`);
          return;
        }
      }
      showSuccess('Gallery media details updated.', 'Updated');
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
      showSuccess(
        `Media "${deleteTarget.title || 'Selected'}" removed from the gallery and its Cloudinary asset (if present).`,
        'Deleted'
      );
      setDeleteTarget(null);
    } catch (err) {
      showError(err.message || 'Failed to remove media from the gallery');
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
          <h1 className="text-2xl font-bold text-primary-dark">Gallery Media Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload optimized images and videos, and manage their captions and publication visibility.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={16} />
          <span> Add Media</span>
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
            Showing {filteredItems.length} of {gallery?.length || 0} media items
          </span>
        </div>
      </div>

      {/* Photo Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-2xs">
          <ImageIcon size={40} className="mx-auto text-stone-300 mb-3" />
          <h3 className="text-base font-bold text-stone-700">No media found</h3>
          <p className="text-xs text-stone-500 mt-1">Try adjusting your search query or add new media.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs group flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                {item.mediaType === 'video' ? (
                <video
                  src={item.imageUrl}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                ) : (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/images/originalLogo.jpeg';
                  }}
                />
                )}

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
              <h3 className="text-base font-bold text-primary-dark">Add Media to Gallery</h3>
              <button
                disabled={uploading}
                onClick={closeCreateModal}
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
                      disabled={uploading}
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                        setImageUrl(asset.url);
                      }}
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
                  disabled={uploading}
                  onChange={(e) => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    setImageUrl(e.target.value);
                  }}
                  className={inputClasses}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Local File Upload */}
              <div className="p-3 bg-stone-50 border border-dashed border-stone-300 rounded-xl">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Upload Image or Video to Cloudinary
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file && !getGalleryMediaType(file)) {
                      showError('Unsupported file format. Choose JPEG, PNG, WebP, MP4, or WebM.');
                      e.target.value = '';
                      setSelectedFile(null);
                      return;
                    }
                    if (file) setImageUrl('');
                    setSelectedFile(file);
                  }}
                  className="text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                />
                {selectedFile && (
                  <div className="mt-3 flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-2.5">
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-stone-100">
                      {getGalleryMediaType(selectedFile) === 'video' ? (
                        <video
                          src={selectedFilePreview}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={selectedFilePreview}
                          alt="Selected upload preview"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-stone-700">{selectedFile.name}</p>
                      <p className="text-[11px] text-stone-500">
                        Selected {getGalleryMediaType(selectedFile)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      disabled={uploading}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      aria-label={`Remove selected upload ${selectedFile.name}`}
                    >
                      <X size={14} />
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-stone-400 mt-1">
                  JPEG/PNG/WebP are converted to WebP (max 2 MB; source under 50 MB). MP4/WebM are compressed to MP4 (max 5 MB; source under 100 MB).
                </p>
              </div>

              {imageUrl && !selectedFile && (
                <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 p-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={imageUrl}
                      alt="Selected gallery asset"
                      className="h-16 w-24 shrink-0 rounded-md bg-stone-100 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-700">Selected image</p>
                      <p className="truncate text-[11px] text-stone-500">{imageUrl}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedMedia}
                    disabled={uploading}
                    className="ml-3 inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    aria-label="Remove selected local asset or image URL"
                  >
                    <X size={14} />
                    Remove
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploading ? 'Processing and uploading...' : 'Add Media'}
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
              {previewItem.mediaType === 'video' ? (
                <video
                  src={previewItem.imageUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={previewItem.imageUrl}
                  alt={previewItem.title}
                  className="w-full h-full object-contain"
                />
              )}
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
        title="Remove Media"
        message={`Remove "${deleteTarget?.title || 'Selected'}" from the gallery? Any uploaded Cloudinary image or video will also be deleted. Local preset files are only unlinked from the gallery.`}
        confirmText="Remove Media"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
