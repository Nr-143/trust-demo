import { useState } from 'react';
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
  MapPin,
  Calendar,
  Image as ImageIcon,
  Play,
  Info,
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { handleImageFallback } from '../../utils/helpers';
import MediaCarousel from '../../components/common/MediaCarousel';
import ProgrammeMediaPyramid from '../../components/common/ProgrammeMediaPyramid';
import MediaGalleryModal from '../../components/common/MediaGalleryModal';
import ViewportVideo from '../../components/common/ViewportVideo';

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
  const { programmes, isLoading } = useSite();

  const [activeMediaGallery, setActiveMediaGallery] = useState(null);

  const cleanSlug = (slug || '').toLowerCase().trim().replace(/^-+|-+$/g, '');

  // Find programme matching either slug, id, or id without 'prog-' prefix
  const programme = (programmes || []).find((p) => {
    const pSlug = (p.slug || '').toLowerCase().trim().replace(/^-+|-+$/g, '');
    const pId = (p.id || '').toLowerCase().trim();
    const pIdClean = pId.replace(/^prog-/, '');
    const pTitleSlug = (p.title || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return (
      pSlug === cleanSlug ||
      pId === cleanSlug ||
      pIdClean === cleanSlug ||
      pTitleSlug === cleanSlug
    );
  });

  if (isLoading) {
    return (
      <div className="bg-[#FAF8F2] min-h-screen pb-20 animate-pulse">
        <div className="bg-white border-b border-stone-200 py-3">
          <div className="site-container h-6 bg-stone-100 rounded w-48"></div>
        </div>
        <div className="site-container pt-8">
          <div className="bg-white border border-stone-200 rounded-3xl p-8 mb-10">
            <div className="h-6 bg-stone-100 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-stone-100 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-stone-100 rounded w-1/2 mb-6"></div>
            <div className="h-20 bg-stone-100 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

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
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-[#173B2A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36]"
        >
          <ArrowLeft size={14} />
          <span>Back to All Programmes</span>
        </Link>
      </div>
    );
  }

  const Icon = iconMap[programme.icon] || GraduationCap;
  const projects = Array.isArray(programme.projects) ? programme.projects : [];

  return (
    <div className="bg-[#FAF8F2] min-h-screen pb-20">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-stone-200 sticky top-16 z-10">
        <div className="site-container py-3">
          <div className="flex items-center justify-between">
            <ol className="flex items-center gap-2 text-xs text-stone-500">
              <li>
                <Link
                  to="/"
                  className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36] rounded-xs"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-stone-300">/</li>
              <li>
                <Link
                  to="/programmes"
                  className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36] rounded-xs"
                >
                  Programmes
                </Link>
              </li>
              <li aria-hidden="true" className="text-stone-300">/</li>
              <li className="font-semibold text-[#173B2A] truncate max-w-[200px] sm:max-w-none" aria-current="page">
                {programme.title}
              </li>
            </ol>

            <Link
              to="/programmes"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B36] hover:text-[#173B2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36] rounded-xs"
            >
              <ArrowLeft size={13} />
              <span>All Programmes</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="site-container pt-8">

        {/* Section A: Concise Page Header */}
        <section
          aria-labelledby="programme-title"
          className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xs mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-4xl">
              {/* Vertical Category Tag */}
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-[#176B36]">
                  <Icon size={22} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Core Vertical Focus
                  </span>
                  <span className="text-xs font-medium text-emerald-800">
                    Mannin Maindhan Grama Arakkattalai
                  </span>
                </div>
              </div>

              {/* Title & Tamil Translation */}
              <h1 id="programme-title" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#173B2A] tracking-tight leading-tight">
                {programme.fullTitle || programme.title}
              </h1>

              {programme.titleTamil && (
                <p className="text-base sm:text-lg font-tamil text-gray-500 font-medium mt-1 mb-4">
                  {programme.titleTamil}
                </p>
              )}

              {/* Short Introductory Description (What it focuses on and why it matters) */}
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
                {programme.description}
              </p>

              {programme.details && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-3 border-l-2 border-emerald-500 pl-3.5">
                  {programme.details}
                </p>
              )}
            </div>

            {/* Quick Visual Card & Key Highlights */}
            <div className="w-full md:w-80 shrink-0 bg-[#FAF8F2] border border-stone-200/80 rounded-2xl p-4 sm:p-5">
              {programme.highlights && programme.highlights.length > 0 && (
                <div>
                  <h2 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Key Focus Pillars:
                  </h2>
                  <ul className="space-y-1.5">
                    {programme.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-xs text-gray-800">
                        <CheckCircle size={13} className="text-[#176B36] shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        <section aria-labelledby="programme-media-heading" className="mb-12">
          <div className="mb-4">
            <h2 id="programme-media-heading" className="text-xl font-bold text-[#173B2A]">
              Programme Photos & Video
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Browse programme photos and watch the featured video.
            </p>
          </div>
          <ProgrammeMediaPyramid programme={programme} />
        </section>

        {/* Section B: Projects and Completed Activities (Only shown when projects exist) */}
        {projects.length > 0 && (
          <section aria-labelledby="activities-heading" className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-3 border-b border-stone-200">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#176B36] mb-1">
                  <span>Field Documentation</span>
                </div>
                <h2 id="activities-heading" className="text-xl sm:text-2xl font-bold text-[#173B2A]">
                  Projects & Community Activities
                </h2>
              </div>
              <p className="text-xs text-stone-500 max-w-sm sm:text-right">
                Individual grassroots initiatives planned or undertaken under this programme vertical.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {projects.map((proj) => {
                const images = Array.isArray(proj.images)
                  ? proj.images.filter((url) => typeof url === 'string' && url)
                  : [];
                const mediaItems = [
                  ...images.map((url) => ({ url, mediaType: 'image' })),
                  ...(proj.videoUrl ? [{ url: proj.videoUrl, mediaType: 'video' }] : []),
                ];
                const hasImages = images.length > 0;
                const hasVideo = Boolean(proj.videoUrl);
                const openMediaGallery = (index = 0) =>
                  setActiveMediaGallery({ items: mediaItems, title: proj.title, initialIndex: index });

                return (
                  <article
                    key={proj.id}
                    className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Media Area - Auto play scroll images & auto play video */}
                      {mediaItems.length > 0 ? (
                        <div className="relative h-60 bg-stone-900 overflow-hidden group">
                          <MediaCarousel
                            items={mediaItems}
                            alt={proj.title}
                            className="h-full w-full"
                            imageClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            interval={3500}
                            autoPlay={true}
                            onImageError={handleImageFallback}
                            onMediaClick={(idx) => openMediaGallery(idx)}
                          />
                          <button
                            type="button"
                            onClick={() => openMediaGallery()}
                            aria-label={`View all media for ${proj.title}`}
                            className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-black/60 hover:bg-black/85 backdrop-blur-xs text-white transition-colors cursor-pointer"
                          >
                            <ImageIcon size={12} />
                            <span>{mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="h-32 bg-stone-50 border-b border-stone-200 flex flex-col items-center justify-center p-4 text-center">
                          <ImageIcon size={24} className="text-stone-300 mb-1" />
                          <p className="text-xs text-stone-500 font-medium">
                            Field photographs will be updated shortly.
                          </p>
                        </div>
                      )}

                      {/* Project Body */}
                      <div className="p-5 sm:p-6">
                        <h3 className="text-lg font-bold text-[#173B2A] leading-snug mb-2">
                          {proj.title}
                        </h3>

                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                          {proj.description}
                        </p>

                        {/* Location and Date Metadata */}
                        <div className="space-y-1.5 pt-3 border-t border-stone-100 text-xs text-stone-600">
                          {proj.location && (
                            <div className="flex items-start gap-2">
                              <MapPin size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                              <span>{proj.location}</span>
                            </div>
                          )}

                          {proj.date && (
                            <div className="flex items-start gap-2">
                              <Calendar size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                              <span>{proj.date}</span>
                            </div>
                          )}
                        </div>

                        {/* Mandatory Client Placeholder Notice */}
                        <div className="mt-4 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-start gap-2 text-xs text-amber-900 font-medium">
                          <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
                          <span>{proj.placeholderNotice || 'Project information will be added after confirmation.'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions (Functional Media Viewers) */}
                    {mediaItems.length > 0 && (
                      <div className="px-5 sm:px-6 pb-5 pt-2 flex items-center gap-2 border-t border-stone-100 bg-stone-50/50">
                        <button
                          type="button"
                          onClick={() => openMediaGallery()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-500 text-xs font-semibold text-[#173B2A] hover:text-[#176B36] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36] cursor-pointer"
                        >
                          <ImageIcon size={13} />
                          <span>
                            View {hasVideo ? 'Media' : 'Photos'} ({mediaItems.length})
                          </span>
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Navigation & Action Panel */}
        <section
          aria-label="Programme Actions"
          className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Link
              to="/programmes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36]"
            >
              <ArrowLeft size={15} />
              <span>Back to All 6 Programmes</span>
            </Link>
            <span className="text-xs text-stone-500 hidden sm:inline">
              Explore the rest of our community development verticals
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link
              to="/volunteer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-[#173B2A] text-xs font-semibold border-2 border-[#173B2A]/20 hover:border-[#173B2A] transition-colors flex-1 sm:flex-initial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36]"
            >
              <span>Volunteer for this Vertical</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/donate"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF9800] hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors flex-1 sm:flex-initial cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36]"
            >
              <Heart size={14} className="fill-white/20" />
              <span>Support This Mission</span>
            </Link>
          </div>
        </section>
      </main>

      {activeMediaGallery && (
        <MediaGalleryModal
          items={activeMediaGallery.items}
          title={activeMediaGallery.title}
          initialIndex={activeMediaGallery.initialIndex}
          onClose={() => setActiveMediaGallery(null)}
        />
      )}
    </div>
  );
}
