import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';
import { useSite, useDonationModal } from '../../context/SiteContext';
import { formatCurrency, handleImageFallback } from '../../utils/helpers';
import { Users, MapPin, Heart, ArrowRight, Sparkles, Calendar, Search } from 'lucide-react';

export default function CampaignsPage() {
  const { campaigns } = useSite();
  const { openDonationModal } = useDonationModal();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Only published and non-archived campaigns appear in public listings
  const publishedCampaigns = useMemo(() => {
    return (campaigns || []).filter((c) => {
      const isPublished =
        c.publicationStatus === 'published' ||
        (!c.publicationStatus && c.status !== 'archived');
      const isNotArchived = c.status !== 'archived';

      const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
      const matchesSearch =
        (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.location || '').toLowerCase().includes(searchQuery.toLowerCase());

      return isPublished && isNotArchived && matchesCat && matchesSearch;
    });
  }, [campaigns, selectedCategory, searchQuery]);

  // Extract available categories
  const categories = useMemo(() => {
    const set = new Set();
    (campaigns || []).forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [campaigns]);

  return (
    <>
      <PageHeader
        title="Featured Fundraising Campaigns"
        titleTamil="கிராம வளர்ச்சி நிதி திரட்டும் பிரச்சாரங்கள்"
        description="Targeted grassroots initiatives designed to resolve pressing drinking water, education, and ecological needs in Dharmapuri villages."
      />

      <div className="site-container py-10 sm:py-14">
        {/* Filter & Search Bar */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-8 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                All Causes
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {cat}
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
                placeholder="Search causes or villages..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {publishedCampaigns.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center shadow-2xs">
            <Heart size={40} className="mx-auto text-stone-300 mb-3" />
            <h3 className="text-base font-bold text-stone-700">No campaigns found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No published campaigns matching "${searchQuery}". Clear your search query.`
                : 'No active published campaigns in this category right now.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedCampaigns.map((campaign) => {
              // Mathematical safeguard: prevent division by zero
              const goal = Number(campaign.goalAmount) || 0;
              const raised = Number(campaign.raisedAmount) || 0;
              const rawPercentage = goal > 0 ? Math.round((raised / goal) * 100) : 0;
              const visualPercentage = Math.min(100, rawPercentage);
              const isExceeded = raised > goal;

              const campaignUrl = `/campaigns/${campaign.slug || campaign.id}`;

              return (
                <div
                  key={campaign.id}
                  className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image with Tag */}
                    <div className="relative h-56 overflow-hidden bg-stone-100">
                      {campaign.imageUrl && (
                        <img
                          src={campaign.imageUrl}
                          alt={campaign.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={handleImageFallback}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-[#173B2A] shadow-xs">
                        {campaign.category || 'Rural Cause'}
                      </span>

                      {campaign.location && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white/95 font-medium">
                          <MapPin size={13} className="text-accent" />
                          <span>{campaign.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <Link to={campaignUrl}>
                        <h3 className="font-bold text-lg text-[#173B2A] leading-snug hover:text-primary transition-colors">
                          {campaign.fullTitle || campaign.title}
                        </h3>
                      </Link>

                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-2.5 mb-5 line-clamp-2">
                        {campaign.shortDescription || campaign.description}
                      </p>

                      {/* Financial Progress Box */}
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 mb-2">
                        <div className="flex justify-between items-baseline text-xs mb-2">
                          <div>
                            <span className="text-[11px] text-stone-500 block">Raised</span>
                            <span className="font-extrabold text-base text-[#173B2A]">
                              {formatCurrency(raised)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-stone-500 block">Goal</span>
                            <span className="font-bold text-stone-700">
                              {formatCurrency(goal)}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar Capped at 100% visually */}
                        <div className="h-2.5 bg-stone-200/80 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isExceeded
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                                : 'bg-gradient-to-r from-amber-500 to-[#FF9800]'
                            }`}
                            style={{ width: `${visualPercentage}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-stone-600 mt-2 font-medium">
                          <span className={isExceeded ? 'text-emerald-800 font-bold' : 'text-amber-800 font-bold'}>
                            {rawPercentage}% completed {isExceeded && '(Exceeded)'}
                          </span>
                          <span className="flex items-center gap-1 text-stone-500">
                            <Users size={12} />
                            <span>{campaign.donorsCount || 0} supporters</span>
                          </span>
                        </div>

                        {/* Exceeded Target Indicator */}
                        {isExceeded && (
                          <div className="mt-2 pt-2 border-t border-stone-200/60 text-[10px] text-emerald-800 flex items-center gap-1 font-semibold">
                            <Sparkles size={12} className="shrink-0" />
                            <span>Surplus: {formatCurrency(raised - goal)} over target</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-6 pt-1 grid grid-cols-2 gap-2.5">
                    <Link
                      to={campaignUrl}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-bold transition-colors"
                    >
                      <span>View Cause</span>
                      <ArrowRight size={13} />
                    </Link>

                    <Link
                      to={`${campaignUrl}#donate`}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FF9800] hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
                    >
                      <Heart size={13} className="fill-white/20" />
                      <span>Support Cause</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
