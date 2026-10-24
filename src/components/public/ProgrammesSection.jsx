import { useState } from 'react';
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
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { handleImageFallback } from '../../utils/helpers';

const programmeIconMap = {
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

export default function ProgrammesSection() {
  const { programmes } = useSite();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Education', 'Water & Health', 'Environment', 'Livelihood'];

  const activeProgrammes = (programmes || []).filter(
    (p) => p.status === 'active' || p.status === 'published' || !p.status
  );

  const filteredProgrammes =
    selectedCategory === 'All'
      ? activeProgrammes
      : activeProgrammes.filter((p) => {
          if (selectedCategory === 'Education') return p.category.includes('Education');
          if (selectedCategory === 'Water & Health')
            return (
              p.category.includes('Water') ||
              p.category.includes('Health') ||
              p.category.includes('Sanitation')
            );
          if (selectedCategory === 'Environment')
            return p.category.includes('Environment') || p.category.includes('Energy');
          if (selectedCategory === 'Livelihood')
            return p.category.includes('Livelihood') || p.category.includes('Community');
          return true;
        });

  return (
    <section className="bg-[#FAF8F2] py-16 sm:py-20 border-b border-stone-200/60" id="programmes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-[#173B2A] border border-emerald-200 mb-3">
            <span>Our 9 Core Verticals</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173B2A] tracking-tight">
            Integrated Rural Development Programmes
          </h2>
          <p className="mt-3 text-base text-gray-600 leading-relaxed font-normal">
            Addressing deep-rooted rural challenges through 9 distinct pillars spanning education,
            clean drinking water, youth empowerment, healthcare, and sustainable agriculture.
          </p>

          {/* Quick Filter Pill Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#176B36] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 9 Programmes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredProgrammes.map((prog) => {
            const Icon = programmeIconMap[prog.icon] || GraduationCap;
            return (
              <article
                key={prog.id}
                className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-2xs hover:shadow-lg hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-stone-100">
                    <img
                      src={prog.imageUrl}
                      alt={prog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={handleImageFallback}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Category Pill Tag */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-[#173B2A] shadow-xs">
                      {prog.category}
                    </span>

                    {/* Floating Icon Circle */}
                    <div className="absolute bottom-3 right-3 h-10 w-10 rounded-xl bg-white text-[#176B36] shadow-md flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6">
                    <h3 className="text-lg font-bold text-[#173B2A] group-hover:text-[#176B36] transition-colors leading-snug">
                      {prog.title}
                    </h3>

                    {prog.titleTamil && (
                      <p className="text-xs font-tamil text-gray-500 font-medium mt-0.5 mb-2">
                        {prog.titleTamil}
                      </p>
                    )}

                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {prog.description}
                    </p>

                    {/* Programme Highlights List */}
                    {prog.highlights && (
                      <div className="space-y-1.5 pt-3 border-t border-stone-100">
                        {prog.highlights.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-stone-600">
                            <CheckCircle size={13} className="text-[#176B36] shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with "Learn More" Link */}
                <div className="px-5 sm:px-6 pb-5 pt-2">
                  <Link
                    to={`/programmes#${prog.id}`}
                    className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-xs font-semibold text-[#173B2A] hover:text-[#176B36] border border-stone-200 hover:border-emerald-200 transition-colors"
                  >
                    <span>Learn More About Programme</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* View All Programmes CTA Banner */}
        <div className="mt-12 text-center">
          <Link
            to="/programmes"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#173B2A] hover:bg-[#176B36] text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <span>Explore Comprehensive Programme Details & Field Reports</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}

