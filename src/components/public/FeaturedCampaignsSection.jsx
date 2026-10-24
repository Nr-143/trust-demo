import { Link } from 'react-router-dom';
import { Heart, Users, MapPin, ArrowRight, AlertCircle, PlusCircle } from 'lucide-react';
import { useSite, useDonationModal } from '../../context/SiteContext';
import { formatCurrency, handleImageFallback } from '../../utils/helpers';

export default function FeaturedCampaignsSection() {
  const { campaigns } = useSite();
  const { openDonationModal } = useDonationModal();

  // Grab the 3 published demonstration campaigns
  const featured = (campaigns || [])
    .filter(
      (c) =>
        (c.publicationStatus === 'published' ||
          (!c.publicationStatus && c.status !== 'archived')) &&
        c.status !== 'archived'
    )
    .slice(0, 3);

  return (
    <section className="bg-white py-16 sm:py-20 border-b border-gray-100" id="campaigns">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 mb-2">
              <Heart size={12} className="text-accent fill-accent" />
              <span>Direct Village Causes</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173B2A] tracking-tight">
              Featured Campaigns
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-xl">
              Targeted community fundraising initiatives delivering urgent drinking water kiosks,
              education kits, and native afforestation.
            </p>
          </div>

          <Link
            to="/campaigns"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#176B36] hover:text-[#173B2A] transition-colors"
          >
            <span>View All Campaigns</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Clear Demo Data Disclaimer */}
        <div className="mb-8 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-accent shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-stone-900 font-semibold">Demonstration Campaign Data:</strong>{' '}
            All target amounts, raised figures, and supporter counts shown below are demonstration
            records to illustrate platform presentation. Try pledging a demo contribution to watch metrics
            update in real-time across components and browser tabs.
          </p>
        </div>

        {/* 3 Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {featured.map((camp) => {
            const goal = Number(camp.goalAmount) || 0;
            const raised = Number(camp.raisedAmount) || 0;
            const rawPercent = goal > 0 ? Math.round((raised / goal) * 100) : 0;
            const percent = Math.min(100, rawPercent);
            const campaignUrl = `/campaigns/${camp.slug || camp.id}`;

            return (
              <div
                key={camp.id}
                className="group bg-[#FAF8F2] rounded-2xl overflow-hidden border border-stone-200/90 shadow-2xs hover:shadow-lg hover:border-amber-400/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Campaign Image */}
                  <div className="relative h-52 overflow-hidden bg-stone-100">
                    <img
                      src={camp.imageUrl}
                      alt={camp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={handleImageFallback}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Badge Pill */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/95 text-[#173B2A] shadow-xs">
                      <span>{camp.category || 'Rural Initiative'}</span>
                    </div>

                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white tracking-wider uppercase">
                      Demo Data
                    </div>

                    {camp.location && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] text-white/90">
                        <MapPin size={12} className="text-accent" />
                        <span>{camp.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Campaign Details */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[#173B2A] group-hover:text-amber-700 transition-colors leading-snug mb-2">
                      {camp.title}
                    </h3>

                    <p className="text-sm text-gray-600 leading-relaxed mb-5">
                      {camp.description}
                    </p>

                    {/* Financial Progress Box */}
                    <div className="bg-white p-4 rounded-xl border border-stone-200/70 mb-2">
                      <div className="flex items-baseline justify-between text-xs mb-1.5">
                        <span className="font-extrabold text-base text-[#173B2A]">
                          {formatCurrency(camp.raisedAmount)}
                        </span>
                        <span className="text-gray-500 text-xs">
                          Goal: <strong className="text-gray-700">{formatCurrency(camp.goalAmount)}</strong>
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-[#FF9800] rounded-full transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 font-medium">
                        <span className="text-amber-700 font-bold">{percent}% funded</span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          <span>{camp.donorsCount || 0} supporters (demo)</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card CTA Footer with Live Pledge Trigger */}
                <div className="px-6 pb-6 pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openDonationModal(camp.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FF9800] hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                  >
                    <Heart size={14} className="fill-white/30" />
                    <span>Support Cause</span>
                  </button>

                  <Link
                    to={campaignUrl}
                    className="px-3.5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
                    title="View details"
                  >
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
