import { useState, useMemo } from 'react';
import { Play, Film } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useSite } from '../../context/SiteContext';
import { handleImageFallback } from '../../utils/helpers';
import ViewportVideo from '../../components/common/ViewportVideo';
import LazyImage from '../../components/common/LazyImage';
import MediaGalleryModal from '../../components/common/MediaGalleryModal';

export default function GalleryPage() {
  const { gallery } = useSite();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeModalMedia, setActiveModalMedia] = useState(null);

  // Filter only published gallery items
  const publishedGallery = useMemo(() => {
    return (gallery || []).filter((g) => g.status === 'published' || !g.status);
  }, [gallery]);

  const categories = ['All', ...new Set(publishedGallery.map((g) => g.category))];
  const filtered =
    activeCategory === 'All'
      ? publishedGallery
      : publishedGallery.filter((g) => g.category === activeCategory);

  const modalItems = useMemo(() => {
    return filtered.map((item) => ({
      url: item.imageUrl,
      mediaType: item.mediaType || 'image',
      title: item.title,
    }));
  }, [filtered]);

  const handleOpenMedia = (index) => {
    setActiveModalMedia({ index });
  };

  return (
    <>
      <PageHeader
        title="Gallery"
        titleTamil="புகைப்படத் தொகுப்பு"
        description="A visual journey through our work and the communities we serve."
      />

      <div className="site-container py-12 sm:py-16">

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">No media in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleOpenMedia(idx)}
                className="group relative overflow-hidden rounded-2xl bg-stone-100 border border-stone-200/80 shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-900">
                  {item.mediaType === 'video' ? (
                    <div className="relative w-full h-full">
                      <ViewportVideo
                        src={item.imageUrl}
                        ariaLabel={item.title}
                        className="w-full h-full object-cover"
                        controls={false}
                      />

                      {/* Visible Frosted Play Button Overlay */}
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition-colors pointer-events-none">
                        <div className="w-13 h-13 rounded-full bg-black/60 backdrop-blur-md border border-white/50 flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:bg-[#176B36] group-hover:border-emerald-400 transition-all">
                          <Play size={22} className="fill-white translate-x-0.5" />
                        </div>
                      </div>

                      {/* Corner Video Badge */}
                      <span className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-xs text-white border border-white/20 flex items-center gap-1 shadow-sm">
                        <Film size={11} />
                        <span>Video</span>
                      </span>
                    </div>
                  ) : (
                    <LazyImage
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      wrapperClassName="w-full h-full"
                      onError={handleImageFallback}
                    />
                  )}

                  {/* Category Tag */}
                  <span className="absolute top-3 right-3 z-20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-stone-800 backdrop-blur-xs shadow-xs">
                    {item.category}
                  </span>
                </div>

                {/* Caption Bar */}
                <div className="p-3.5 bg-white flex items-center justify-between gap-2 border-t border-stone-100">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-stone-800 truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      {item.category} {item.mediaType === 'video' ? '• Video' : '• Photo'}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Interactive Lightbox Modal */}
      {activeModalMedia !== null && (
        <MediaGalleryModal
          items={modalItems}
          title={modalItems[activeModalMedia.index]?.title || 'Gallery Media'}
          initialIndex={activeModalMedia.index}
          onClose={() => setActiveModalMedia(null)}
        />
      )}
    </>
  );
}
