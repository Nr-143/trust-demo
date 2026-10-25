import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Briefcase,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  X,
  Search,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/helpers';

const jobApplicationSchema = z.object({
  name: z.string().min(2, 'Please enter your full name (at least 2 characters)'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number'),
  experience: z.string().min(2, 'Please summarize your background or years of experience'),
  skills: z.string().min(2, 'Please highlight key skills or qualifications'),
  message: z.string().optional().default(''),
});

export default function CareersPage() {
  const { careers } = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [applyingCareer, setApplyingCareer] = useState(null);
  const [submittedApp, setSubmittedApp] = useState(null);

  // Only published and open listings appear publicly
  const publishedCareers = useMemo(() => {
    return (careers || []).filter((c) => {
      const isOpen = c.status === 'open';
      const isPublished = c.publicationStatus === 'published' || (!c.publicationStatus && isOpen);
      const notArchived = c.status !== 'archived' && c.publicationStatus !== 'archived';

      const matchesType = selectedType === 'all' || c.type === selectedType;
      const matchesSearch =
        (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      return isOpen && isPublished && notArchived && matchesType && matchesSearch;
    });
  }, [careers, selectedType, searchQuery]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(jobApplicationSchema),
  });

  const handleOpenApplyModal = (career) => {
    setApplyingCareer(career);
    setSubmittedApp(null);
    reset();
  };

  const onSubmitApplication = (formData) => {
    try {
      if (!applyingCareer) return;

      const payload = {
        careerId: applyingCareer.id,
        careerTitle: applyingCareer.title,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        experience: formData.experience.trim(),
        skills: formData.skills.trim(),
        message: formData.message.trim(),
        status: 'New',
        submittedAt: new Date().toISOString(),
        isDemo: true,
      };

      dispatch({
        type: 'ADD_JOB_APPLICATION',
        payload,
      });

      setSubmittedApp(payload);
      showSuccess(
        `Application submitted for "${applyingCareer.title}"! Stored in local demo database.`,
        'Application Sent'
      );
      reset();
    } catch (err) {
      showError(err.message || 'Failed to submit application', 'Error');
    }
  };

  const inputClasses =
    'w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';

  return (
    <>
      <PageHeader
        title="Careers & Field Opportunities"
        titleTamil="வேலைவாய்ப்புகள் & களப்பணிகள்"
        description="Build a purposeful career in grassroots rural development, community health, and educational equity across Dharmapuri."
      />

      <div className="site-container py-10 sm:py-14">
        {/* Demonstration Disclaimer */}
        <div className="mb-8">
          <DemoBadge message="Demonstration Notice: The job openings and application forms below represent demonstration listings designed for organizational review. Submissions are stored locally in the browser's data layer without transmitting personal data to external recruiters or servers." />
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-8 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Type Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'Full-time', 'Part-time', 'Internship'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer whitespace-nowrap ${
                    selectedType === type
                      ? 'bg-primary text-white shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {type === 'all' ? 'All Roles' : type}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[240px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job titles, locations..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Listings */}
        {publishedCareers.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-14 text-center shadow-2xs">
            <Briefcase size={40} className="mx-auto text-stone-300 mb-3" />
            <h3 className="text-base font-bold text-stone-700">No open positions found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No career listings matching "${searchQuery}". Clear your search query.`
                : 'There are currently no active published vacancies. Check back soon or consider volunteering.'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {publishedCareers.map((career) => (
              <article
                key={career.id}
                className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
              >
                <div className="max-w-3xl space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      {career.type}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      Demo Listing
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-primary-dark group-hover:text-primary transition-colors">
                    {career.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin size={13} className="text-primary" />
                      <span>{career.location}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock size={13} className="text-stone-400" />
                      <span>Posted {formatDate(career.postedDate)}</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
                    {career.description}
                  </p>

                  {career.skills && (
                    <div className="pt-2 flex items-center gap-2 text-xs text-stone-600">
                      <Award size={14} className="text-emerald-700 shrink-0" />
                      <span>
                        <strong>Required Background: </strong>
                        {career.skills}
                      </span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center">
                  <button
                    type="button"
                    onClick={() => handleOpenApplyModal(career)}
                    className="w-full md:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Apply for Role</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* SAMPLE JOB APPLICATION MODAL */}
      {applyingCareer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                  Sample Application Form
                </span>
                <h3 className="text-lg font-bold text-primary-dark mt-0.5">
                  {applyingCareer.title}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                  <MapPin size={12} />
                  <span>{applyingCareer.location} • {applyingCareer.type}</span>
                </p>
              </div>
              <button
                onClick={() => setApplyingCareer(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {submittedApp ? (
              <div className="py-6 text-center space-y-3.5 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-base font-bold text-primary-dark">
                  Application Submitted, {submittedApp.name}!
                </h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  Your sample application for <strong>{submittedApp.careerTitle}</strong> has been saved in the shared demo data layer. Administrators can review it under <strong>Admin &gt; Careers</strong>.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyingCareer(null)}
                    className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmitApplication)} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    {...register('name')}
                    className={inputClasses}
                    placeholder="e.g. Anitha Soundararajan"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className={inputClasses}
                      placeholder="e.g. anitha@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>

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
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Experience / Education Background *
                  </label>
                  <input
                    {...register('experience')}
                    className={inputClasses}
                    placeholder="e.g. Master in Social Work (MSW) or 2 years in village coordination"
                  />
                  {errors.experience && (
                    <p className="text-xs text-red-500 mt-1">{errors.experience.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Relevant Skills & Qualifications *
                  </label>
                  <input
                    {...register('skills')}
                    className={inputClasses}
                    placeholder="e.g. Rural community mobilization, Tamil & English, team leadership"
                  />
                  {errors.skills && (
                    <p className="text-xs text-red-500 mt-1">{errors.skills.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Cover Note / Why this role?
                  </label>
                  <textarea
                    rows={3}
                    {...register('message')}
                    className={inputClasses}
                    placeholder="Explain why you want to work with Mannin Maindhan Grama Arakkattalai..."
                  />
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setApplyingCareer(null)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Submit Sample Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
