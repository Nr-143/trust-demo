import { Link } from 'react-router-dom';
import { Heart, Users, ArrowRight, CheckCircle, Sparkles, MapPin } from 'lucide-react';
import { useSite, useDonationModal } from '../../context/SiteContext';
import { handleImageFallback } from '../../utils/helpers';

export default function HeroSection() {
  const { siteInfo } = useSite();
  const { openDonationModal } = useDonationModal();

  const heroHeading = siteInfo.heroHeading || 'Building Stronger Villages. Creating Lasting Change.';
  const heroSubheading =
    siteInfo.heroSubheading ||
    'Working alongside rural communities to improve access to education, clean water, healthcare, livelihoods, and a sustainable future across Dharmapuri and rural Tamil Nadu.';

  return (
    <section className="relative bg-[#FAF8F2] border-b border-stone-200/60 overflow-hidden">
      {/* Subtle organic background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: NGO Information & Copy */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Small NGO Identification Label */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-[#173B2A] border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-[#176B36] animate-pulse"></span>
                <span>{siteInfo.nameTamil}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-200/70 text-stone-700">
                <MapPin size={11} className="text-primary" />
                <span>Dharmapuri, Tamil Nadu</span>
              </span>
            </div>

            {/* Sub-label Organization Identity */}
            <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#176B36] mb-2">
              Mannin Maindhan Grama Arakattalai
            </p>

            {/* Compelling Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-5xl font-extrabold text-[#173B2A] tracking-tight leading-[1.18] mb-4">
              {heroHeading}
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6 max-w-2xl font-normal">
              {heroSubheading}
            </p>

            {/* Proposed Copy Notice */}
            <div className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs">
              <Sparkles size={13} className="text-accent shrink-0" />
              <span>
                <strong>Proposed Marketing Copy:</strong> Live-editable via the Admin Dashboard.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mb-8">
              {/* Primary CTA */}
              <button
                type="button"
                onClick={() => openDonationModal()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF9800] hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Heart size={17} className="fill-white/20" />
                <span>{siteInfo.primaryCtaText || 'Support Our Mission'}</span>
                <ArrowRight size={15} />
              </button>

              {/* Secondary CTA */}
              <Link
                to="/volunteer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 active:bg-stone-100 text-[#173B2A] font-semibold text-sm border-2 border-[#173B2A]/20 hover:border-[#173B2A] transition-all duration-150 shadow-2xs"
              >
                <Users size={17} className="text-[#176B36]" />
                <span>{siteInfo.secondaryCtaText || 'Become a Volunteer'}</span>
              </Link>
            </div>

            {/* Trust Highlights Checklist */}
            <div className="pt-6 border-t border-stone-200/80 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-[#176B36] shrink-0" />
                <span className="text-xs font-medium text-gray-700">6 Core Verticals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-[#176B36] shrink-0" />
                <span className="text-xs font-medium text-gray-700">Palacode & Dharmapuri</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-[#176B36] shrink-0" />
                <span className="text-xs font-medium text-gray-700">100% Volunteer Driven</span>
              </div>
            </div>

          </div>

          {/* Right Column: High Quality Natural Photography */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Frame Behind */}
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-emerald-600/20 to-amber-400/20 transform rotate-1 blur-xs"></div>
              
              {/* Main Natural Photo Container */}
              <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg border border-stone-200">
                <img
                  src="https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=1000&auto=format&fit=crop&q=80"
                  alt="Rural community development activities in Tamil Nadu"
                  className="w-full h-80 sm:h-96 lg:h-[430px] object-cover hover:scale-102 transition-transform duration-500"
                  loading="eager"
                  onError={handleImageFallback}
                />

                {/* Gradient vignette at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating Emblem Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs p-2 rounded-xl shadow-md border border-stone-200/80 flex items-center gap-2.5">
                  <img
                    src={siteInfo.logoBadge || '/images/logo-badge.jpeg'}
                    alt="MMG Trust Badge"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-600/30"
                    onError={(e) => {
                      e.currentTarget.src = '/images/logo-full.jpeg';
                    }}
                  />
                  <div className="pr-1 text-left">
                    <p className="text-[11px] font-bold text-[#173B2A] leading-tight">MMG Trust</p>
                    <p className="text-[10px] text-gray-500 font-tamil leading-tight">மண்ணின் மைந்தன்</p>
                  </div>
                </div>

                {/* Bottom Caption Card on Image */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-4 rounded-xl shadow-md border border-stone-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#173B2A] uppercase tracking-wider">
                      Grassroots Impact
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Community Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-snug">
                    Serving Eruthukuttahalli, Palacode, and neighbouring agrarian hamlets with sustainable rural solutions.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

