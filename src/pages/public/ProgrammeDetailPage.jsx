import { useParams, Link } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  TreePine,
  HeartPulse,
  Waves,
  Heart,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  FolderKanban,
  Sparkles,
} from 'lucide-react';
import { useSite, useDonationModal } from '../../context/SiteContext';
import { handleImageFallback } from '../../utils/helpers';
import DemoBadge from '../../components/common/DemoBadge';

const iconMap = {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  TreePine,
  HeartPulse,
  Waves,
};

export default function ProgrammeDetailPage() {
  const { slug } = useParams();
  const { programmes } = useSite();
  const { openDonationModal } = useDonationModal();

  const cleanSlug = (slug || '').toLowerCase().trim();

  // Find programme matching either slug, id, or id without 'prog-' prefix
  const programme = (programmes || []).find((p) => {
    const pSlug = (p.slug || '').toLowerCase().trim();
    const pId = (p.id || '').toLowerCase().trim();
    const pIdClean = pId.replace(/^prog-/, '');

    return (
      pSlug === cleanSlug ||
      pId === cleanSlug ||
      pIdClean === cleanSlug ||
      p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug
    );
  });

  if (!programme) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="p-4 bg-stone-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center text-stone-500">
          <FolderKanban size={32} />
        </div>
        <h1 className="text-2xl font-bold text-[#173B2A]">Programme Not Found</h1>
        <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto">
          The requested programme vertical could not be found or has been updated.
        </p>
        <Link
          to="/programmes"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-[#173B2A] transition-colors focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ArrowLeft size={14} />
          <span>Back to All 6 Programmes</span>
        </Link>
      </div>
    );
  }

  const Icon = iconMap[programme.icon] || GraduationCap;

  return (
    <div className="bg-[#FAF8F2] min-h-screen pb-20">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <ol className="flex items-center gap-2 text-xs text-stone-500">
            <li>
              <Link
                to="/"
                className="hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary rounded-xs"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                to="/programmes"
                className="hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary rounded-xs"
              >
                Programmes
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-[#173B2A] truncate" aria-current="page">
              {programme.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Demonstration Disclaimer */}
        <div className="mb-8">
          <DemoBadge message={`Detailed overview page for "${programme.title}". This layout highlights the grassroots development scope and field objectives for this vertical.`} />
        </div>

        {/* Programme Header Card */}
        <article className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xs mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Visual Photo Banner */}
            <div className="lg:col-span-5 relative h-72 lg:h-auto min-h-[300px] bg-stone-100">
              <img
                src={programme.imageUrl}
                alt={programme.title}
                className="w-full h-full object-cover"
                loading="eager"
                onError={handleImageFallback}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-[#173B2A] shadow-xs">
                  {programme.category}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {programme.status || 'Active'}
                </span>
              </div>
            </div>

            {/* Header Content */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-emerald-100 text-[#176B36]">
                    <Icon size={26} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                      Core Programme Vertical
                    </span>
                    <span className="text-xs font-medium text-emerald-700">
                      Mannin Maindhan Grama Arakattalai
                    </span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#173B2A] tracking-tight leading-tight">
                  {programme.fullTitle || programme.title}
                </h1>

                {programme.titleTamil && (
                  <p className="text-base sm:text-lg font-tamil text-gray-500 font-medium mt-1 mb-5">
                    {programme.titleTamil}
                  </p>
                )}

                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6">
                  {programme.description}
                </p>

                {programme.details && (
                  <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-stone-200/80 mb-6">
                    <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-accent" />
                      <span>Operational Focus & Field Methodology</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {programme.details}
                    </p>
                  </div>
                )}
              </div>

              {/* Key Highlights */}
              {programme.highlights && programme.highlights.length > 0 && (
                <div className="pt-4 border-t border-stone-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                    Key Programme Pillars:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {programme.highlights.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200/60 text-xs text-gray-800 font-medium"
                      >
                        <CheckCircle size={15} className="text-[#176B36] shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Action Panel */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/programmes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            >
              <ArrowLeft size={15} />
              <span>All 6 Programmes</span>
            </Link>
            <span className="text-xs text-stone-500 hidden sm:inline">
              Explore the rest of our community development verticals
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link
              to="/volunteer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-[#173B2A] text-xs font-semibold border-2 border-[#173B2A]/20 hover:border-[#173B2A] transition-colors flex-1 sm:flex-initial focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span>Volunteer for this Role</span>
              <ArrowRight size={14} />
            </Link>

            <button
              type="button"
              onClick={() => openDonationModal()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF9800] hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors flex-1 sm:flex-initial cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Heart size={14} className="fill-white/20" />
              <span>Support This Mission</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

