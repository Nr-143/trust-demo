import { useState, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';
import { useSite } from '../../context/SiteContext';
import { handleImageFallback } from '../../utils/helpers';

export default function GalleryPage() {
  const { gallery } = useSite();
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter only published gallery items
  const publishedGallery = useMemo(() => {
    return (gallery || []).filter((g) => g.status === 'published' || !g.status);
  }, [gallery]);

  const categories = ['All', ...new Set(publishedGallery.map((g) => g.category))];
  const filtered =
    activeCategory === 'All'
      ? publishedGallery
      : publishedGallery.filter((g) => g.category === activeCategory);

  return (
    <>
      <PageHeader
        title="Gallery"
        titleTamil="புகைப்படத் தொகுப்பு"
        description="A visual journey through our work and the communities we serve."
      />

      <div className="site-container py-12 sm:py-16">
        <div className="mb-6">
          <DemoBadge message="Gallery images are placeholder stock photos. Actual photos from the organisation's activities will replace these." />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">No images in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={handleImageFallback}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-sm font-medium">{item.title}</p>
                  <span className="text-white/70 text-xs">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

