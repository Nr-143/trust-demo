import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, X, CheckCircle, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/helpers';
import { createDonationPledge } from '../../services/supabaseService';

const donationFormSchema = z.object({
  campaignId: z.string().min(1, 'Please select a campaign'),
  donorName: z.string().min(2, 'Please enter your full name (at least 2 characters)'),
  donorEmail: z.string().email('Please enter a valid email address'),
  donorPhone: z.string().optional(),
  amount: z.number().min(10, 'Minimum contribution pledge is ₹10'),
  message: z.string().optional(),
});

const presetAmounts = [500, 1000, 2500, 5000];

export default function DonationModal({ isOpen, onClose, defaultCampaignId = null }) {
  const { campaigns } = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError } = useToast();

  const [selectedPreset, setSelectedPreset] = useState(1000);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastDonation, setLastDonation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const activeCampaigns = (campaigns || []).filter((c) => c.status === 'active');
  const initialCampId = defaultCampaignId || activeCampaigns[0]?.id || '';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      campaignId: initialCampId,
      amount: 1000,
      donorName: '',
      donorEmail: '',
      donorPhone: '',
      message: '',
    },
  });

  const currentAmount = watch('amount');

  const handleSelectPreset = (val) => {
    setSelectedPreset(val);
    setValue('amount', val, { shouldValidate: true });
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const targetCamp = (campaigns || []).find((c) => c.id === formData.campaignId);
      const campaignTitle = targetCamp ? targetCamp.title : 'Rural Development Fund';

      const payload = {
        campaignId: formData.campaignId,
        campaignTitle,
        amount: formData.amount,
        donorName: formData.donorName,
        donorEmail: formData.donorEmail,
        donorPhone: formData.donorPhone,
        message: formData.message,
      };

      const savedPledge = await createDonationPledge(payload);

      dispatch({
        type: 'RECORD_PLEDGE',
        payload: savedPledge,
      });

      setLastDonation(savedPledge);
      setIsSuccess(true);
      showSuccess(
        `Thank you ${formData.donorName}! Your pledge of ${formatCurrency(formData.amount)} has been recorded.`,
        'Pledge Recorded'
      );
    } catch (err) {
      showError(err.message || 'Failed to record donation pledge', 'Submission Error');
    } finally {
      setSubmitting(false);
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
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-2 rounded-xl bg-accent text-[#173B2A]">
              <Heart size={18} className="fill-current" />
            </span>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Community Contribution Pledge
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Support Our Rural Mission
          </h2>
          <p className="text-xs text-white/75 mt-1 leading-relaxed">
            Record your contribution commitment. Our team will contact you directly with official trust 80G tax receipt and banking transfer details.
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
                Your contribution pledge of{' '}
                <strong className="text-[#176B36]">{formatCurrency(lastDonation.amount)}</strong> for{' '}
                <strong className="text-gray-900">{lastDonation.campaignTitle}</strong> has been saved directly in our Supabase database.
              </p>

              <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 text-left">
                <div className="flex items-start gap-2">
                  <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <p>
                    <strong>Next Steps:</strong> An authorized trustee from Mannin Maindhan Grama Arakkattalai will reach out to <strong>{lastDonation.donorEmail}</strong> with official NGO banking transfer details and 80G tax exemption confirmation.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-[#176B36] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#173B2A] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Campaign Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Initiative / Campaign *
                </label>
                <select
                  {...register('campaignId')}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
                >
                  {activeCampaigns.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.title} ({formatCurrency(camp.goalAmount)} target)
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
                  Select Pledge Amount (INR) *
                </label>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-2">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectPreset(amt)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
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
                    placeholder="Custom pledge amount"
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

              {/* Phone and Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    {...register('donorPhone')}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
                    placeholder="+91 98421 XXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Note / Dedication (optional)
                  </label>
                  <input
                    {...register('message')}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
                    placeholder="e.g. In memory of / For clean drinking water..."
                  />
                </div>
              </div>

              {/* Trust Transparency Note */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-gray-500 flex items-start gap-2">
                <ShieldCheck size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Online card payments are currently being integrated. Submitting this pledge records your verified intention with the NGO team.
                </span>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving Pledge to Database...</span>
                    </>
                  ) : (
                    <>
                      <Heart size={16} className="fill-white/30" />
                      <span>Confirm Contribution Pledge</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
