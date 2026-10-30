import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Heart,
  Calendar,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileText,
  Clock,
  RotateCcw,
  Receipt,
  Share2,
  Loader2,
} from 'lucide-react';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate, handleImageFallback } from '../../utils/helpers';

const PRESET_AMOUNTS = [100, 500, 1000, 2000];

export default function CampaignDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { campaigns, donationPledges, demoDonations, siteInfo } = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError } = useToast();

  // Find target campaign by slug or ID
  const campaign = useMemo(() => {
    const list = campaigns || [];
    const cleanSlug = (slug || '').toLowerCase().trim();
    return list.find((c) => (c.slug && c.slug.toLowerCase() === cleanSlug) || c.id === slug) || null;
  }, [campaigns, slug]);

  // Stepper state for Donation:
  // 1 = Amount & Donor Info
  // 2 = Review & Confirm
  // 3 = Success Receipt
  const [step, setStep] = useState(1);

  // Form states
  const [selectedPreset, setSelectedPreset] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorMessage, setDonorMessage] = useState('');
  const [completedDonation, setCompletedDonation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Scroll to donate section if hash is #donate
  useEffect(() => {
    if (location.hash === '#donate') {
      const el = document.getElementById('donate-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  // Calculations with zero-division safeguard and surplus handling
  const goalAmount = Number(campaign?.goalAmount) || 0;
  const raisedAmount = Number(campaign?.raisedAmount) || 0;
  const donorsCount = Number(campaign?.donorsCount) || 0;

  const rawPercent = goalAmount > 0 ? Math.round((raisedAmount / goalAmount) * 100) : 0;
  const visualPercent = Math.min(100, rawPercent);
  const isGoalExceeded = raisedAmount > goalAmount;
  const surplusAmount = isGoalExceeded ? raisedAmount - goalAmount : 0;

  // Recent donations for this campaign
  const pledges = donationPledges || demoDonations || [];
  const campaignDonations = useMemo(() => {
    if (!campaign) return [];
    return pledges
      .filter((d) => d.campaignId === campaign.id || d.campaignTitle === campaign.title)
      .slice(0, 5);
  }, [pledges, campaign]);

  // Computed active donation amount
  const activeAmount = customAmount ? Number(customAmount) : selectedPreset;

  const handleSelectPreset = (amount) => {
    setSelectedPreset(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
    if (val) {
      setSelectedPreset(null);
    }
  };

  const handleProceedToReview = (e) => {
    e.preventDefault();

    if (!activeAmount || activeAmount < 10) {
      showError('Minimum contribution amount is ₹10');
      return;
    }

    if (!donorName.trim()) {
      showError('Please enter your name');
      return;
    }

    if (!donorEmail.trim() || !donorEmail.includes('@')) {
      showError('Please enter a valid email address');
      return;
    }

    setStep(2); // Move to Review
    const donateElem = document.getElementById('donate-section');
    if (donateElem) donateElem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleConfirmPledge = () => {
    try {
      const receiptId = `MMG-PLEDGE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const payload = {
        id: receiptId,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        donorPhone: donorPhone.trim() || undefined,
        amount: Number(activeAmount),
        message: donorMessage.trim() || '',
        paymentMethod: 'Direct Contribution Pledge',
        timestamp: new Date().toISOString(),
        isDemo: false,
      };

      // Dispatches to SiteContext & persists in LocalStorage
      dispatch({
        type: 'RECORD_DONATION',
        payload,
      });

      setCompletedDonation(payload);
      setStep(3); // Success Receipt
      showSuccess(
        `Thank you ${donorName}! Your pledge of ${formatCurrency(activeAmount)} has been credited to ${campaign.title}.`,
        'Pledge Recorded'
      );

      const donateElem = document.getElementById('donate-section');
      if (donateElem) donateElem.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      showError(err.message || 'Failed to record contribution');
    }
  };

  const handleResetForAnotherDonation = () => {
    setStep(1);
    setSelectedPreset(1000);
    setCustomAmount('');
    setDonorMessage('');
    setCompletedDonation(null);
  };

  // If campaign not found
  if (!campaign) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="p-4 bg-stone-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center text-stone-500">
          <Heart size={32} />
        </div>
        <h1 className="text-2xl font-bold text-primary-dark">Campaign Not Found</h1>
        <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto">
          The requested campaign initiative could not be found or has not been published yet.
        </p>
        <Link
          to="/campaigns"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to All Campaigns</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F2] min-h-screen pb-20">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-stone-200">
        <div className="site-container py-3.5">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/campaigns" className="hover:text-primary transition-colors">
              Campaigns
            </Link>
            <span>/</span>
            <span className="text-stone-900 font-semibold truncate max-w-xs">{campaign.title}</span>
          </div>
        </div>
      </div>

      <div className="site-container py-8 sm:py-12">
                
        {/* Main Grid: Left Column Details & Narrative | Right Column Donation Stepper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: Campaign Hero, Progress, & Narrative (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Hero Image Card */}
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xs">
              <div className="relative h-72 sm:h-96 w-full bg-stone-100">
                {campaign.imageUrl && (
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                    onError={handleImageFallback}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-primary-dark shadow-xs">
                    {campaign.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#176B36] text-white uppercase tracking-wider">
                    Active Initiative
                  </span>
                </div>

                {/* Bottom Overlay Location */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin size={14} className="text-accent shrink-0" />
                    <span>{campaign.location || 'Palacode Block, Dharmapuri'}</span>
                  </div>
                  {campaign.endDate && (
                    <div className="flex items-center gap-1.5 font-medium bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                      <Calendar size={13} className="text-accent shrink-0" />
                      <span>Target Date: {campaign.endDate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-dark leading-tight">
                  {campaign.fullTitle || campaign.title}
                </h1>

                <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
                  {campaign.shortDescription || campaign.description}
                </p>

                {/* Timeline metadata */}
                <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-stone-100 text-xs text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" />
                    <span>Initiative Active from {campaign.startDate || '2026'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#176B36]" />
                    <span>Organized by Mannin Maindhan Trust</span>
                  </div>
                </div>
              </div>
            </div>

            {/* In-Depth Campaign Narrative */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  The Grassroots Challenge
                </span>
                <h2 className="text-xl font-bold text-primary-dark mt-1">Why This Cause Matters</h2>
                <div className="mt-3 text-sm text-stone-700 leading-relaxed space-y-3 whitespace-pre-line">
                  {campaign.fullDescription || campaign.description}
                </div>
              </div>

              {/* Transparency & Budget Breakdown */}
              <div className="pt-6 border-t border-stone-100">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Transparency Framework
                </span>
                <h2 className="text-base font-bold text-primary-dark mt-1">Budget Allocation</h2>
                <p className="text-xs text-stone-500 mt-1 mb-4">
                  How collected contributions are allocated toward village project execution:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="text-lg font-extrabold text-primary-dark block">65%</span>
                    <span className="font-bold text-stone-700 block mt-0.5">Direct Equipment & Materials</span>
                    <span className="text-[11px] text-stone-500 mt-1 block">Hardware, saplings, RO filters, or books</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="text-lg font-extrabold text-primary-dark block">25%</span>
                    <span className="font-bold text-stone-700 block mt-0.5">Field Installation & Labour</span>
                    <span className="text-[11px] text-stone-500 mt-1 block">Local village craftsmen & technicians</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="text-lg font-extrabold text-primary-dark block">10%</span>
                    <span className="font-bold text-stone-700 block mt-0.5">Community Stewardship</span>
                    <span className="text-[11px] text-stone-500 mt-1 block">Training village committee & audits</span>
                  </div>
                </div>
              </div>

              {/* Recent Community Donors for this Campaign */}
              <div className="pt-6 border-t border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-primary-dark">Recent Contributions</h2>
                  <span className="text-xs text-stone-400">{campaignDonations.length} records</span>
                </div>

                {campaignDonations.length === 0 ? (
                  <p className="text-xs text-stone-500 italic py-2">
                    No contributions recorded for this campaign yet. Be the first to contribute!
                  </p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {campaignDonations.map((d) => (
                      <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-stone-800">{d.donorName}</p>
                          {d.message && <p className="text-stone-500 italic mt-0.5">&quot;{d.message}&quot;</p>}
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-700">{formatCurrency(d.amount)}</span>
                          <span className="block text-[10px] text-stone-400">{formatDate(d.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Progress & Contribution Section (5 cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24" id="donate-section">
            
            {/* LIVE FINANCIAL PROGRESS CARD */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Total Amount Raised
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Live Sync
                </span>
              </div>

              {/* Raised vs Goal */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-primary-dark">
                  {formatCurrency(raisedAmount)}
                </span>
                <span className="text-sm text-stone-500 font-medium">
                  of {formatCurrency(goalAmount)} goal
                </span>
              </div>

              {/* Progress Bar with capped 100% visual width */}
              <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200/80 mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isGoalExceeded ? 'bg-gradient-to-r from-emerald-600 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-[#FF9800]'
                  }`}
                  style={{ width: `${visualPercent}%` }}
                />
              </div>

              {/* Progress stats & surplus indicator */}
              <div className="flex items-center justify-between text-xs text-stone-600 font-semibold mb-4">
                <span>{rawPercent}% completed</span>
                <span className="flex items-center gap-1 text-stone-500 font-normal">
                  <Users size={13} className="text-stone-400" />
                  <span>{donorsCount} supporters pledged</span>
                </span>
              </div>

              {/* Special callout when fundraising target is exceeded */}
              {isGoalExceeded && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2 text-xs text-emerald-900">
                  <Sparkles size={16} className="text-emerald-700 shrink-0" />
                  <span>
                    <strong>Target Exceeded!</strong> Raised an additional{' '}
                    <strong>{formatCurrency(surplusAmount)}</strong> beyond the initial goal for expanded village coverage.
                  </span>
                </div>
              )}

              {/* STEP 1: DONATION AMOUNT SELECTION & DONOR FORM */}
              {step === 1 && (
                <form onSubmit={handleProceedToReview} className="space-y-4 pt-2">
                  <div className="border-t border-stone-100 pt-4">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      1. Choose Contribution Amount
                    </label>

                    {/* Presets: ₹100, ₹500, ₹1000, ₹2000 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {PRESET_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleSelectPreset(amt)}
                          className={`py-2.5 px-2 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                            selectedPreset === amt && !customAmount
                              ? 'border-primary bg-primary text-white shadow-2xs'
                              : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          {formatCurrency(amt)}
                        </button>
                      ))}
                    </div>

                    {/* Custom Amount Field */}
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="10"
                        step="10"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        placeholder="Or enter custom amount (Min. ₹10)"
                        className="w-full pl-8 pr-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      2. Contributor Details
                    </label>

                    <div>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Your Full Name *"
                        required
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="Your Email Address *"
                        required
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        placeholder="Phone Number (Optional)"
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        value={donorMessage}
                        onChange={(e) => setDonorMessage(e.target.value)}
                        placeholder="Encouragement message for the village committee (Optional)"
                        className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Assurance Notice */}
                  <div className="p-3 bg-stone-50 border border-stone-200/90 rounded-xl flex items-start gap-2 text-[11px] text-stone-600">
                    <ShieldCheck size={16} className="text-[#176B36] shrink-0 mt-0.5" />
                    <span>
                      <strong>Direct Village Pledge:</strong> Your contribution directly supports verified rural developmental projects on the ground.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#FF9800] hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Review Contribution</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}

              {/* STEP 2: DONATION REVIEW SCREEN */}
              {step === 2 && (
                <div className="space-y-4 pt-4 border-t border-stone-100 animate-fadeIn">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <FileText size={15} />
                    <span>Review Your Pledge</span>
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
                    <div className="flex justify-between items-baseline border-b border-stone-200/60 pb-2">
                      <span className="text-stone-500">Target Initiative:</span>
                      <span className="font-bold text-primary-dark text-right max-w-[200px] truncate">
                        {campaign.title}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline border-b border-stone-200/60 pb-2">
                      <span className="text-stone-500">Selected Contribution:</span>
                      <span className="text-lg font-extrabold text-[#176B36]">
                        {formatCurrency(activeAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline border-b border-stone-200/60 pb-2">
                      <span className="text-stone-500">Contributor:</span>
                      <span className="font-semibold text-stone-800">{donorName}</span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-stone-500">Email:</span>
                      <span className="text-stone-700">{donorEmail}</span>
                    </div>

                    {donorMessage && (
                      <div className="pt-2 border-t border-stone-200/60">
                        <span className="text-stone-500 block mb-0.5">Note:</span>
                        <p className="italic text-stone-700">&quot;{donorMessage}&quot;</p>
                      </div>
                    )}
                  </div>

                  {/* Impact Note */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <ShieldCheck size={15} className="text-emerald-700" />
                      <span>Direct Grassroots Impact</span>
                    </div>
                    Clicking <strong>Confirm Contribution</strong> will record your support pledge and notify our village project team.
                  </div>

                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleConfirmPledge}
                      className="w-2/3 py-3 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin shrink-0" />
                          <span>Recording...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Confirm Contribution</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DONATION SUCCESS PAGE / RECEIPT */}
              {step === 3 && completedDonation && (
                <div className="space-y-4 pt-4 border-t border-stone-100 animate-fadeIn text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-bounce">
                    <CheckCircle2 size={32} />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Pledge Recorded Successfully
                    </span>
                    <h3 className="text-xl font-extrabold text-primary-dark mt-0.5">
                      Thank You, {completedDonation.donorName}!
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Your contribution pledge has been recorded for this cause.
                    </p>
                  </div>

                  {/* Receipt Box */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                      <div className="flex items-center gap-1.5 font-bold text-stone-700">
                        <Receipt size={14} className="text-primary" />
                        <span>Receipt ID</span>
                      </div>
                      <code className="text-stone-800 font-mono text-[11px] font-bold">
                        {completedDonation.id}
                      </code>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-stone-500">Pledge Amount:</span>
                      <span className="text-base font-extrabold text-emerald-700">
                        {formatCurrency(completedDonation.amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-stone-500">Beneficiary Cause:</span>
                      <span className="font-semibold text-stone-800 truncate max-w-[200px]">
                        {completedDonation.campaignTitle}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-stone-500">Timestamp:</span>
                      <span className="text-stone-600">{formatDate(completedDonation.timestamp)}</span>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-500 italic">
                      Notice: Thank you for standing with our rural communities. The MMG Trust team will reach out with project milestones.
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handleResetForAnotherDonation}
                      className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Make Another Contribution</span>
                    </button>

                    <Link
                      to="/campaigns"
                      className="w-full py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Explore Other Village Campaigns</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
