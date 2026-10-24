import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, X, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/helpers';

const donationFormSchema = z.object({
  campaignId: z.string().min(1, 'Please select a campaign'),
  donorName: z.string().min(2, 'Please enter your name'),
  donorEmail: z.string().email('Please enter a valid email address'),
  amount: z.number().min(10, 'Minimum contribution is ₹10'),
  message: z.string().optional(),
});

const presetAmounts = [100, 500, 1000, 2000];

export default function DonationModal({ isOpen, onClose, defaultCampaignId = null }) {
  const { campaigns } = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError } = useToast();

  const [selectedPreset, setSelectedPreset] = useState(1000);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastDonation, setLastDonation] = useState(null);

  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const initialCampId = defaultCampaignId || activeCampaigns[0]?.id || '';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      campaignId: initialCampId,
      amount: 1000,
      donorName: '',
      donorEmail: '',
      message: '',
    },
  });

  const currentAmount = watch('amount');

  const handleSelectPreset = (val) => {
    setSelectedPreset(val);
    setValue('amount', val, { shouldValidate: true });
  };

  const onSubmit = (formData) => {
    try {
      const targetCamp = campaigns.find((c) => c.id === formData.campaignId);
      const campaignTitle = targetCamp ? targetCamp.title : 'Rural Development Fund';

      const payload = {
        ...formData,
        campaignTitle,
      };

      // Dispatch to shared state (which updates state and persists via donationsRepository)
      dispatch({
        type: 'RECORD_DONATION',
        payload,
      });

      setLastDonation({ ...payload, campaignTitle });
      setIsSuccess(true);
      showSuccess(
        `Thank you ${formData.donorName}! Demo contribution of ${formatCurrency(formData.amount)} recorded for ${campaignTitle}.`,
        'Demonstration Pledge Recorded'
      );
    } catch (err) {
      showError(err.message || 'Failed to record demonstration donation', 'Error');
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 transform transition-all animate-fadeIn"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Banner */}
        <div className="bg-[#173B2A] text-white p-6 sm:p-7 relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-2 rounded-xl bg-accent text-[#173B2A]">
              <Heart size={18} className="fill-current" />
            </span>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Demonstration Contribution
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Support Our Rural Mission
          </h2>
          <p className="text-xs text-white/75 mt-1 leading-relaxed">
            Test our real-time campaign funding mechanism. Updates campaign metrics immediately across the site.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7">
          {isSuccess && lastDonation ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-emerald-100 text-[#176B36] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} />
              </div>
              <h3 className="text-xl font-bold text-[#173B2A]">
                Pledge Successfully Recorded!
              </h3>
              <p className="text-sm text-gray-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong className="text-gray-900">{lastDonation.donorName}</strong>.
                Your demo contribution of{' '}
                <strong className="text-[#176B36]">{formatCurrency(lastDonation.amount)}</strong> has
                been credited to <strong className="text-gray-900">{lastDonation.campaignTitle}</strong>.
              </p>

              <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 text-left">
                <div className="flex items-start gap-2">
                  <Sparkles size={16} className="text-accent shrink-0 mt-0.5" />
                  <p>
                    <strong>Data Layer Verification:</strong> The campaign's progress bar and donor count
                    have been updated in shared state and saved to LocalStorage. You can refresh the page
                    or open another tab to observe the immediate change!
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-[#176B36] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#173B2A] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Campaign Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Choose Campaign *
                </label>
                <select
                  {...register('campaignId')}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
                >
                  {activeCampaigns.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.title} ({formatCurrency(camp.raisedAmount)} raised of {formatCurrency(camp.goalAmount)})
                    </option>
                  ))}
                </select>
                {errors.campaignId && (
                  <p className="text-xs text-red-500 mt-1">{errors.campaignId.message}</p>
                )}
              </div>

              {/* Preset Amounts */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Select Contribution Amount (INR) *
                </label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-2">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectPreset(amt)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        currentAmount === amt
                          ? 'bg-[#176B36] text-white border-[#176B36] shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    {...register('amount', { valueAsNumber: true })}
                    className="w-full pl-8 pr-3.5 py-2 text-sm font-semibold border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
                    placeholder="Custom amount"
                  />
                </div>
                {errors.amount && (
                  <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>
                )}
              </div>

              {/* Donor Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    {...register('donorName')}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
                    placeholder="Full name"
                  />
                  {errors.donorName && (
                    <p className="text-xs text-red-500 mt-1">{errors.donorName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...register('donorEmail')}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
                    placeholder="you@example.com"
                  />
                  {errors.donorEmail && (
                    <p className="text-xs text-red-500 mt-1">{errors.donorEmail.message}</p>
                  )}
                </div>
              </div>

              {/* Optional message */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Dedication or Note (optional)
                </label>
                <input
                  {...register('message')}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
                  placeholder="e.g. In memory of / For clean drinking water..."
                />
              </div>

              {/* Demo notice */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-gray-500 flex items-start gap-2">
                <ShieldCheck size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  This is a front-end demonstration pledge. No real payment card or bank account will be charged.
                </span>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#FF9800] hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50"
                >
                  <Heart size={16} className="fill-white/30" />
                  <span>Submit Demonstration Pledge</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

