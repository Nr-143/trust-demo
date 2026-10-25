import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, BookOpen } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { handleImageFallback } from '../../utils/helpers';

export default function CommunityStoriesSection() {
  const { stories } = useSite();

  if (!stories || stories.length === 0) return null;

  return (
    <section className="bg-[#FAF8F2] py-16 sm:py-20 border-b border-stone-200/60" id="stories">
      <div className="site-container">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-[#173B2A] border border-emerald-200 mb-2">
              <BookOpen size={13} className="text-[#176B36]" />
              <span>Voices from the Soil</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173B2A] tracking-tight">
              Community Stories & Activities
            </h2>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Authentic field highlights showcasing how rural youth, farming families, and elders work
              together to rebuild village infrastructure.
            </p>
          </div>

          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#176B36] hover:text-[#173B2A] transition-colors"
          >
            <span>View Community Gallery</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {stories.map((story) => (
            <article
              key={story.id}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-2xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Photo Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={handleImageFallback}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Category Pill Tag */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/95 text-[#173B2A] shadow-xs">
                    {story.category}
                  </span>

                  <span className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] text-white/95 font-medium">
                    <MapPin size={12} className="text-accent" />
                    <span>{story.location}</span>
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Calendar size={13} />
                    <span>{story.date}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-emerald-700 font-medium">{story.badge}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#173B2A] group-hover:text-[#176B36] transition-colors leading-snug mb-1">
                    {story.title}
                  </h3>

                  {story.titleTamil && (
                    <p className="text-xs font-tamil text-gray-500 font-medium mb-3">
                      {story.titleTamil}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {story.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-5 sm:px-6 pb-5 pt-1">
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176B36] group-hover:text-emerald-800 transition-colors"
                >
                  <span>Explore photo documentation</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

