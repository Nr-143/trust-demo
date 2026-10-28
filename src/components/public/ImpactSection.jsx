import { FolderKanban, MapPin, Users, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';

const iconMap = {
  FolderKanban,
  MapPin,
  Users,
  CheckCircle2,
};

export default function ImpactSection() {
  const { impact } = useSite();

  return (
    <section className="bg-white py-14 sm:py-18 border-b border-gray-100">
      <div className="site-container">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#176B36] border border-emerald-200/60 mb-2">
              <span>Field Metrics & Progress</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#173B2A] tracking-tight">
              Community Footprint
            </h2>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              Driving tangible change through direct village engagement and sustainable social initiatives.
            </p>
          </div>

          <Link
            to="/impact"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#176B36] hover:text-[#173B2A] transition-colors"
          >
            <span>View Detailed Impact Reports</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* 4 Configurable Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {impact.stats.map((stat) => {
            const Icon = iconMap[stat.icon] || Users;
            return (
              <div
                key={stat.id}
                className="group relative bg-[#FAF8F2] hover:bg-white rounded-2xl p-6 border border-stone-200/80 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-2.5 rounded-xl bg-emerald-100/70 text-[#176B36] group-hover:bg-[#176B36] group-hover:text-white transition-colors">
                      <Icon size={22} />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800">
                      Verified
                    </span>
                  </div>

                  <p className="text-3xl sm:text-4xl font-extrabold text-[#173B2A] tracking-tight mb-1">
                    {stat.value}
                  </p>

                  <h3 className="text-base font-bold text-gray-800 leading-snug">
                    {stat.label}
                  </h3>

                  {stat.labelTamil && (
                    <p className="text-xs font-tamil text-gray-500 font-medium mt-0.5">
                      {stat.labelTamil}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/60 text-xs text-gray-500 leading-snug">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

