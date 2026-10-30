import {
  FolderKanban,
  MapPin,
  Users,
  CheckCircle2,
  Heart,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useSite } from '../../context/SiteContext';

const iconMap = {
  FolderKanban,
  MapPin,
  Users,
  CheckCircle2,
};

export default function ImpactPage() {
  const { impact, programmes, siteInfo } = useSite();

  return (
    <>
      <PageHeader
        title="Field Impact & Outcomes"
        titleTamil="எங்கள் செயல்பாடுகளின் தாக்கம்"
        description="Tracking meaningful rural transformations across education, water conservation, and community health."
      />

      <div className="site-container py-12 sm:py-16">
        <div className="mb-8">
          <DemoBadge message={impact.disclaimer || 'The figures and progress metrics displayed below are demonstration counts for evaluation. Certified periodic field audit data will be posted following verification.'} />
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {impact.stats.map((stat) => {
            const Icon = iconMap[stat.icon] || Users;
            return (
              <div
                key={stat.id}
                className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-2xs text-center flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex p-3 rounded-2xl bg-emerald-100/80 text-[#176B36] mb-4">
                    <Icon size={26} />
                  </div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#173B2A] tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{stat.label}</p>
                  {stat.labelTamil && (
                    <p className="text-xs font-tamil text-gray-500 font-medium mt-0.5">
                      {stat.labelTamil}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-gray-500">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Breakdown by 6 Programmes */}
        <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-2xs mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-[#176B36]">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#173B2A]">
                Activity Across All 6 Verticals
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Community coverage overview across {siteInfo?.district || 'Palacode Taluk and Dharmapuri'} rural regions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programmes.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[#FAF8F2] border border-stone-200/80 flex items-start justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{p.category}</p>
                  <p className="text-sm font-bold text-[#173B2A] mt-0.5">{p.title}</p>
                  <p className="text-xs font-tamil text-gray-500 mt-0.5">{p.titleTamil}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 shrink-0">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Commitment Banner */}
        <div className="bg-[#173B2A] text-white rounded-3xl p-8 sm:p-12 text-center shadow-lg">
          <Heart size={32} className="mx-auto text-accent mb-4" />
          <h2 className="text-2xl sm:text-3xl font-extrabold">Sustainable Village Progress</h2>
          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
            Every litre of drinking water filtered, every pond desilted, and every student tutored contributes
            to an independent, prosperous rural community. Join our volunteer team to make this vision reality.
          </p>
        </div>

      </div>
    </>
  );
}
