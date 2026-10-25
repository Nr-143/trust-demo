import { useState, useEffect } from 'react';
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
  X,
  ChevronLeft,
  ChevronRight,
  Info,
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

  // Media Modal state for viewing photographs and video
  const [activeMediaModal, setActiveMediaModal] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveMediaModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-[#173B2A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36]"
        >
          <ArrowLeft size={14} />
          <span>Back to All 6 Programmes</span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Demonstration Disclaimer */}
        <div className="mb-6">
          <DemoBadge message="Demonstration Profile: Programme activities, scopes, and images shown below represent initial framework data. Verified completed field projects, dates, and photographic records will be published after confirmation by the NGO." />
        </div>

        {/* Section A: Concise Page Header */}
        <section
          aria-labelledby="programme-title"
          className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xs mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-3xl">
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
                    Mannin Maindhan Grama Arakattalai
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
              <div className="relative h-36 rounded-xl overflow-hidden mb-4 bg-stone-100">
                <img
                  src={programme.imageUrl}
                  alt={programme.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={handleImageFallback}
                />
                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-xs text-white">
                  {programme.category}
                </span>
              </div>

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

        {/* Section B: Projects and Completed Activities */}
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

          {projects.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center">
              <div className="p-3 bg-stone-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center text-stone-500">
                <FolderKanban size={24} />
              </div>
              <h3 className="text-base font-bold text-[#173B2A]">No Projects Recorded Yet</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                Project information will be added after confirmation by the NGO.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {projects.map((proj) => {
                const hasImages = Array.isArray(proj.images) && proj.images.length > 0;
                const hasVideo = !!proj.videoUrl;

                return (
                  <article
                    key={proj.id}
                    className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Media Area */}
                      {hasImages ? (
                        <div className="relative h-56 bg-stone-100 overflow-hidden group">
                          <img
                            src={proj.images[0]}
                            alt={proj.title}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                            loading="lazy"
                            onError={handleImageFallback}
                          />

                          {/* Clickable Image Lightbox Overlay Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMediaModal({
                                type: 'image',
                                title: proj.title,
                                url: proj.images[0],
                                images: proj.images,
                                index: 0,
                              })
                            }
                            aria-label={`View full photos for ${proj.title}`}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          >
                            <ImageIcon size={18} />
                            <span>View Photograph ({proj.images.length})</span>
                          </button>

                          {/* Image Counter Badge if multiple images */}
                          {proj.images.length > 1 && (
                            <span className="absolute bottom-3 right-3 px-2 py-1 rounded-md text-[11px] font-semibold bg-black/70 backdrop-blur-xs text-white flex items-center gap-1 pointer-events-none">
                              <ImageIcon size={12} />
                              <span>{proj.images.length} Photos</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="h-32 bg-stone-50 border-b border-stone-200 flex flex-col items-center justify-center p-4 text-center">
                          <ImageIcon size={24} className="text-stone-300 mb-1" />
                          <p className="text-xs text-stone-500 font-medium">
                            Photographs will be added after confirmation.
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
                    {(hasImages || hasVideo) && (
                      <div className="px-5 sm:px-6 pb-5 pt-2 flex items-center gap-2 border-t border-stone-100 bg-stone-50/50">
                        {hasImages && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMediaModal({
                                type: 'image',
                                title: proj.title,
                                url: proj.images[0],
                                images: proj.images,
                                index: 0,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-500 text-xs font-semibold text-[#173B2A] hover:text-[#176B36] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36] cursor-pointer"
                          >
                            <ImageIcon size={13} />
                            <span>View Photos ({proj.images.length})</span>
                          </button>
                        )}

                        {hasVideo && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMediaModal({
                                type: 'video',
                                title: proj.title,
                                url: proj.videoUrl,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#173B2A] hover:bg-[#176B36] text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36] cursor-pointer"
                          >
                            <Play size={13} className="fill-white" />
                            <span>Watch Video</span>
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

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

            <button
              type="button"
              onClick={() => openDonationModal()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF9800] hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors flex-1 sm:flex-initial cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36]"
            >
              <Heart size={14} className="fill-white/20" />
              <span>Support This Mission</span>
            </button>
          </div>
        </section>
      </main>

      {/* Media Viewer Lightbox / Modal (Image & Video) */}
      {activeMediaModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="media-modal-title"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveMediaModal(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-800 text-white">
              <h3 id="media-modal-title" className="text-sm font-semibold truncate pr-4">
                {activeMediaModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveMediaModal(null)}
                aria-label="Close media viewer"
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[75vh]">
              {activeMediaModal.type === 'image' && (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={activeMediaModal.url}
                    alt={activeMediaModal.title}
                    className="max-h-[65vh] w-auto max-w-full object-contain mx-auto"
                    onError={handleImageFallback}
                  />

                  {/* Previous / Next buttons if multiple images */}
                  {activeMediaModal.images && activeMediaModal.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const currentIndex = activeMediaModal.index || 0;
                          const prevIndex =
                            currentIndex === 0
                              ? activeMediaModal.images.length - 1
                              : currentIndex - 1;
                          setActiveMediaModal({
                            ...activeMediaModal,
                            index: prevIndex,
                            url: activeMediaModal.images[prevIndex],
                          });
                        }}
                        aria-label="Previous photo"
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer"
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const currentIndex = activeMediaModal.index || 0;
                          const nextIndex =
                            currentIndex === activeMediaModal.images.length - 1
                              ? 0
                              : currentIndex + 1;
                          setActiveMediaModal({
                            ...activeMediaModal,
                            index: nextIndex,
                            url: activeMediaModal.images[nextIndex],
                          });
                        }}
                        aria-label="Next photo"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer"
                      >
                        <ChevronRight size={20} />
                      </button>

                      <div className="absolute bottom-3 px-3 py-1 rounded-full text-xs bg-black/70 text-white/90">
                        Photo {(activeMediaModal.index || 0) + 1} of {activeMediaModal.images.length}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeMediaModal.type === 'video' && (
                <div className="w-full aspect-video flex items-center justify-center p-4">
                  {activeMediaModal.url?.includes('youtube.com') ||
                  activeMediaModal.url?.includes('youtu.be') ? (
                    <iframe
                      src={activeMediaModal.url}
                      title={activeMediaModal.title}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      controls
                      autoPlay
                      className="w-full max-h-[65vh] rounded-lg"
                      src={activeMediaModal.url}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Caption */}
            <div className="p-3 bg-stone-950 border-t border-stone-800 text-stone-400 text-xs flex items-center justify-between">
              <span>{activeMediaModal.title}</span>
              <span className="text-[11px] text-stone-500">Press ESC or click outside to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
