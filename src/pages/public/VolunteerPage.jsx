import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Heart,
  Send,
  MapPin,
  Clock,
  Award,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';

const volunteerFormSchema = z.object({
  name: z.string().min(2, 'Please enter your full name (at least 2 characters)'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number'),
  preferredOpportunity: z.string().min(1, 'Please select your preferred volunteer opportunity'),
  skills: z.string().min(2, 'Please list any relevant skills, educational background, or interests'),
  availability: z.string().min(1, 'Please specify your availability'),
  message: z.string().optional().default(''),
  honeypot: z.string().optional(),
});

const AVAILABILITY_OPTIONS = [
  'Weekends (2–4 hours)',
  'Saturday Full Day',
  'Sunday Full Day',
  'Weekdays Evenings (1–2 hours)',
  'Flexible / On-call for Events',
  'Full-time Field Placement',
];

export default function VolunteerPage() {
  const { volunteerOpportunities } = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError } = useToast();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [submittedData, setSubmittedData] = useState(null);

  // Filter open / published opportunities
  const opportunities = useMemo(() => {
    const list = volunteerOpportunities || [];
    return list.filter((opp) => {
      const isOpen = opp.status === 'open' || !opp.status;
      const matchesCat = selectedCategory === 'all' || opp.category === selectedCategory;
      return isOpen && matchesCat;
    });
  }, [volunteerOpportunities, selectedCategory]);

  // Categories list
  const categories = useMemo(() => {
    const defaultCats = [
      'Village Cleaning',
      'Drinking-Water Projects',
      'Environmental Protection',
      'Education',
      'Community Health Awareness',
      'Rural Development Field Activities',
    ];
    const set = new Set(defaultCats);
    (volunteerOpportunities || []).forEach((o) => {
      if (o.category) set.add(o.category);
    });
    return Array.from(set);
  }, [volunteerOpportunities]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      preferredOpportunity: '',
      skills: '',
      availability: AVAILABILITY_OPTIONS[0],
      message: '',
    },
  });

  const handleSelectOpportunity = (opp) => {
    setValue('preferredOpportunity', `${opp.title} (${opp.category})`);
    const formElem = document.getElementById('application-form');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (formData) => {
    if (formData.honeypot) {
      setSubmittedData({ name: formData.name });
      return;
    }

    setSubmitting(true);
    try {
      let recordId = null;

      if (isSupabaseConfigured() && supabase) {
        const { data: inserted, error } = await supabase
          .from('volunteer_applications')
          .insert([
            {
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              preferred_opportunity: formData.preferredOpportunity,
              area: formData.preferredOpportunity,
              skills: formData.skills.trim(),
              availability: formData.availability,
              message: formData.message.trim(),
              status: 'New',
            },
          ])
          .select()
          .single();

        if (error) throw error;
        recordId = inserted?.id;

        // Non-blocking email alert via Vercel serverless function
        try {
          fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'volunteer_application',
              record: {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                preferred_opportunity: formData.preferredOpportunity,
                skills: formData.skills.trim(),
                availability: formData.availability,
                message: formData.message.trim(),
              },
            }),
          }).catch(() => {});
        } catch {
          // ignore
        }
      }

      const payload = {
        id: recordId || undefined,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        area: formData.preferredOpportunity,
        preferredOpportunity: formData.preferredOpportunity,
        skills: formData.skills.trim(),
        availability: formData.availability,
        message: formData.message.trim(),
        status: 'New',
        submittedAt: new Date().toISOString(),
        isDemo: !isSupabaseConfigured(),
      };

      dispatch({
        type: 'ADD_VOLUNTEER_APPLICATION',
        payload,
      });

      setSubmittedData(payload);
      showSuccess(
        `Thank you ${formData.name}! Your volunteer application has been received and routed to our field coordination team.`,
        'Application Submitted'
      );
      reset();

      const formElem = document.getElementById('application-form');
      if (formElem) {
        formElem.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Volunteer submission error:', err);
      showError(err.message || 'Failed to submit application. Please try again.', 'Validation Error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    'w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';

  return (
    <>
      <PageHeader
        title="Volunteer With Us"
        titleTamil="எங்களுடன் தன்னார்வலராக இணையுங்கள்"
        description="Join college youth, farmers, teachers, and professionals driving meaningful rural transformation across Dharmapuri villages."
      />

      <div className="site-container py-10 sm:py-14">
        {/* Demonstration Disclaimer */}
        <div className="mb-10">
          <DemoBadge message="Demonstration Environment: Volunteer opportunities and applications submitted below are stored locally in your browser's shared data layer. No real personal information is shared with external servers. Submissions appear immediately in the Admin Volunteer Management console for review." />
        </div>

        {/* SECTION 1: PUBLISHED VOLUNTEER OPPORTUNITIES */}
        <div className="mb-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-[#173B2A] mb-2">
                <Heart size={13} className="text-[#176B36]" />
                <span>Grassroots Field Opportunities</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#173B2A] tracking-tight">
                Current Volunteer Openings
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                Choose an initiative aligned with your skills and availability. Opportunities are organized across 6 core rural focus sectors.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                All Openings
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunities Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white border border-stone-200 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      {opp.category}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                      Demo Opportunity
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-primary-dark group-hover:text-primary transition-colors leading-snug">
                    {opp.title}
                  </h3>

                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-stone-400 shrink-0" />
                      <span className="font-semibold text-stone-700">Location:</span>
                      <span className="truncate">{opp.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-stone-400 shrink-0" />
                      <span className="font-semibold text-stone-700">Commitment:</span>
                      <span>{opp.commitment}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <Award size={13} className="text-stone-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-stone-700">Skills / Eligibility: </span>
                        <span className="text-stone-500">{opp.skills}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleSelectOpportunity(opp)}
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-primary hover:text-white text-stone-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Apply for this Role</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: VOLUNTEER APPLICATION FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start" id="application-form">
          
          {/* Left Column: Context & Guidelines */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                Join the Team
              </span>
              <h2 className="text-2xl font-bold text-primary-dark mt-1 mb-3">
                Volunteer Registration
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                Whether you can contribute two hours over a weekend or lead an ongoing field project, your enthusiasm creates real ripples in rural Tamil Nadu.
              </p>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                  <CheckCircle2 size={16} className="text-[#176B36] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-800">Certificate of Community Service</h4>
                    <p className="text-stone-500 mt-0.5">
                      Formal recognition certificates provided for students and young professionals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                  <CheckCircle2 size={16} className="text-[#176B36] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-800">Grassroots Mentorship</h4>
                    <p className="text-stone-500 mt-0.5">
                      Work directly alongside experienced agriculturalists, engineers, and educators.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                  <CheckCircle2 size={16} className="text-[#176B36] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-800">Direct Village Impact</h4>
                    <p className="text-stone-500 mt-0.5">
                      Tangible outcomes in clean water, education, sapling survival, and village health.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form & Confirmation */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
              
              {/* SUCCESS CONFIRMATION SCREEN */}
              {submittedData ? (
                <div className="py-6 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-bounce">
                    <Check size={32} />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Application Successfully Recorded
                    </span>
                    <h3 className="text-xl font-extrabold text-primary-dark mt-1">
                      Thank You, {submittedData.name}!
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
                      Your volunteer application for <strong>{submittedData.preferredOpportunity}</strong> has been stored in your browser&apos;s LocalStorage demonstration database.
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-2 max-w-md mx-auto">
                    <div className="flex justify-between border-b border-stone-200/60 pb-2">
                      <span className="text-stone-500">Applicant:</span>
                      <span className="font-bold text-stone-800">{submittedData.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200/60 pb-2">
                      <span className="text-stone-500">Role:</span>
                      <span className="font-semibold text-emerald-800 truncate max-w-[220px]">
                        {submittedData.preferredOpportunity}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200/60 pb-2">
                      <span className="text-stone-500">Availability:</span>
                      <span className="text-stone-700">{submittedData.availability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Status:</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                        {submittedData.status}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setSubmittedData(null)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Submit Another Application</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* VOLUNTEER APPLICATION FORM */
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-primary-dark">
                      Submit Your Volunteer Application
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Fill out your details to express interest in village field coordination.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        {...register('name')}
                        className={inputClasses}
                        placeholder="e.g. Ramesh Kumar"
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        className={inputClasses}
                        placeholder="e.g. ramesh@example.com"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        {...register('phone')}
                        className={inputClasses}
                        placeholder="+91 98421 XXXXX"
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Availability *
                      </label>
                      <select {...register('availability')} className={inputClasses}>
                        {AVAILABILITY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Preferred Volunteer Opportunity *
                    </label>
                    <select {...register('preferredOpportunity')} className={inputClasses}>
                      <option value="">-- Choose Opportunity or Interest Area --</option>
                      {opportunities.map((opp) => (
                        <option key={opp.id} value={`${opp.title} (${opp.category})`}>
                          {opp.title} — {opp.category}
                        </option>
                      ))}
                      <option value="General Grassroots Village Assistance">
                        General Grassroots Village Assistance
                      </option>
                    </select>
                    {errors.preferredOpportunity && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.preferredOpportunity.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Relevant Skills or Background *
                    </label>
                    <input
                      {...register('skills')}
                      className={inputClasses}
                      placeholder="e.g. Tutoring, water testing, sports coaching, farming, electrical..."
                    />
                    {errors.skills && (
                      <p className="text-xs text-red-500 mt-1">{errors.skills.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Short Message / Motivation
                    </label>
                    <textarea
                      rows={3}
                      {...register('message')}
                      className={inputClasses}
                      placeholder="Why would you like to volunteer with Mannin Maindhan Grama Arakkattalai?"
                    />
                  </div>

                  {/* Hidden Honeypot for Anti-Spam */}
                  <input
                    type="text"
                    {...register('honeypot')}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Submit Volunteer Application</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
