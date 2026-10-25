import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  TreePine,
  Sun,
  Sparkles,
  HeartPulse,
  Droplets,
  Waves,
  Heart,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';
import { useSite } from '../../context/SiteContext';
import { handleImageFallback } from '../../utils/helpers';

const iconMap = {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  TreePine,
  Sun,
  Sparkles,
  HeartPulse,
  Droplets,
  Waves,
};

export default function ProgrammesPage() {
  const { programmes } = useSite();

  const activeProgrammes = (programmes || []).filter(
    (p) => p.status === 'active' || p.status === 'published' || !p.status
  );

  return (
    <>
      <PageHeader
        title="Our Community Programmes"
        titleTamil="எங்கள் கிராம வளர்ச்சி திட்டங்கள்"
        description={`Comprehensive grassroots developmental initiatives serving rural communities across ${siteInfo.district || 'Palacode and Dharmapuri'} district.`}
      />

      <div className="site-container py-12 sm:py-16">
        <div className="mb-8">
          <DemoBadge message="The 6 programme descriptions below reflect proposed community developmental framework designed for Mannin Maindhan Grama Arakkattalai. Verified baseline surveys and targets will be added continuously." />
        </div>

        {activeProgrammes.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center text-stone-500">
            <p className="text-base font-semibold">No active programmes currently published.</p>
            <p className="text-xs text-stone-400 mt-1">Check back soon or configure programmes in the admin dashboard.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {activeProgrammes.map((prog, index) => {
              const Icon = iconMap[prog.icon] || Heart;
              const targetUrl = `/programmes/${prog.slug || prog.id}`;
              return (
                <article
                  key={prog.id}
                  id={prog.id}
                  className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow scroll-mt-28"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    {/* Photo Column */}
                    <div className="lg:col-span-5 relative h-64 sm:h-72 lg:h-auto bg-stone-100">
                      <Link
                        to={targetUrl}
                        aria-label={`View ${prog.title} programme details`}
                        className="block w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#176B36]"
                      >
                        <img
                          src={prog.imageUrl}
                          alt={prog.title}
                          className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                          loading="lazy"
                          onError={handleImageFallback}
                        />
                      </Link>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden pointer-events-none" />
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-[#173B2A] shadow-xs pointer-events-none">
                        Vertical #{index + 1} • {prog.category}
                      </span>
                    </div>

                    {/* Text Details Column */}
                    <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2.5 rounded-xl bg-emerald-100 text-[#176B36]">
                            <Icon size={22} />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              {prog.category}
                            </span>
                            <span className="ml-2 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                              {prog.status}
                            </span>
                          </div>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold text-[#173B2A]">
                          <Link
                            to={targetUrl}
                            className="hover:underline hover:text-[#176B36] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36] rounded-xs"
                          >
                            {prog.fullTitle || prog.title}
                          </Link>
                        </h2>

                        {prog.titleTamil && (
                          <p className="text-sm font-tamil text-gray-500 font-medium mt-1 mb-4">
                            {prog.titleTamil}
                          </p>
                        )}

                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                          {prog.description}
                        </p>

                        {prog.details && (
                          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6">
                            {prog.details}
                          </p>
                        )}
                      </div>

                      {/* Highlights & CTA */}
                      <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {prog.highlights && (
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                              Key Focus Elements:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {prog.highlights.map((h, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-700">
                                  <CheckCircle size={14} className="text-[#176B36] shrink-0" />
                                  <span>{h}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 sm:pt-0">
                          <Link
                            to={targetUrl}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-emerald-50 text-xs font-semibold text-[#173B2A] hover:text-[#176B36] border border-stone-200 hover:border-emerald-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36] shrink-0"
                          >
                            <span>Explore Programme</span>
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
      )}
    </div>
  </>
);
}
