import { useState } from 'react';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { Edit2, Save, X, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminImpact() {
  const { impact } = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError } = useToast();

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [newStatModal, setNewStatModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleStartEdit = (stat) => {
    setEditingId(stat.id);
    setEditValue(stat.value);
    setEditLabel(stat.label);
    setEditDesc(stat.description || '');
  };

  const handleSaveEdit = (id) => {
    try {
      dispatch({
        type: 'UPDATE_IMPACT_STAT',
        payload: {
          id,
          value: editValue,
          label: editLabel,
          description: editDesc,
        },
      });
      setEditingId(null);
      showSuccess(`Impact metric "${editLabel}" updated in LocalStorage.`, 'Saved');
    } catch (err) {
      showError(err.message || 'Failed to update metric');
    }
  };

  const handleAddStat = (e) => {
    e.preventDefault();
    if (!newLabel || !newValue) {
      showError('Please provide both label and value');
      return;
    }
    try {
      dispatch({
        type: 'ADD_IMPACT_STAT',
        payload: {
          label: newLabel,
          value: newValue,
          description: newDesc,
          icon: 'CheckCircle2',
          isDemo: false,
        },
      });
      setNewLabel('');
      setNewValue('');
      setNewDesc('');
      setNewStatModal(false);
      showSuccess('New metric added to impact statistics.', 'Metric Added');
    } catch (err) {
      showError(err.message || 'Failed to add metric');
    }
  };

  const handleDeleteStat = (id, label) => {
    setDeleteTarget({ id, label });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    try {
      dispatch({ type: 'DELETE_IMPACT_STAT', payload: deleteTarget.id });
      showSuccess(`Metric "${deleteTarget.label}" removed.`, 'Deleted');
      setDeleteTarget(null);
    } catch (err) {
      showError(err.message || 'Failed to delete metric');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Impact Statistics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure live metrics displayed on the homepage and impact page in real-time.
          </p>
        </div>

        <button
          onClick={() => setNewStatModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-2xs cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Custom Metric</span>
        </button>
      </div>

      {/* Grid of editable impact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        {impact.stats.map((stat) => {
          const isEditing = editingId === stat.id;

          return (
            <div
              key={stat.id}
              className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Metric Label
                    </label>
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Counter Value
                    </label>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-3 py-1.5 text-lg font-extrabold text-[#173B2A] border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Description Subtitle
                    </label>
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs text-gray-600 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleSaveEdit(stat.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
                    >
                      <Save size={13} />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 border border-stone-300 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {stat.label}
                      </span>
                      {stat.labelTamil && (
                        <p className="text-xs font-tamil text-gray-400 font-medium">
                          {stat.labelTamil}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(stat)}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit value"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteStat(stat.id, stat.label)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete metric"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="text-3xl sm:text-4xl font-extrabold text-[#173B2A] tracking-tight mt-2">
                    {stat.value}
                  </p>

                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {stat.description || 'Village-level verified metric'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Stat Modal */}
      {newStatModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-fadeIn">
            <button
              onClick={() => setNewStatModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-bold text-[#173B2A] mb-1">Add Custom Impact Metric</h2>
            <p className="text-xs text-gray-500 mb-4">
              Stored in LocalStorage and immediately visible on public impact cards.
            </p>

            <form onSubmit={handleAddStat} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Label *</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Solar Units Installed"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Value *</label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. 18+"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary/30 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Solar lighting points across remote village clusters"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewStatModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark shadow-xs cursor-pointer"
                >
                  Add Metric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Impact Metric"
        message={`Are you sure you want to remove the impact metric "${deleteTarget?.label}"? This will immediately remove it from public impact cards.`}
        confirmText="Delete Metric"
        cancelText="Keep Metric"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
