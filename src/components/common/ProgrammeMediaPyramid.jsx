import { useState } from 'react';
import { getProgrammeMediaItems } from '../../services/mediaProcessing';
import { handleImageFallback } from '../../utils/helpers';
import MediaCarousel from './MediaCarousel';
import MediaGalleryModal from './MediaGalleryModal';
import ViewportVideo from './ViewportVideo';

export default function ProgrammeMediaPyramid({ programme }) {
  const mediaItems = getProgrammeMediaItems(programme);
  const effectiveMediaItems = mediaItems.length > 0
    ? mediaItems
    : (programme?.imageUrl || programme?.image_url
        ? [{ url: programme.imageUrl || programme.image_url, mediaType: 'image' }]
        : []);
  const images = effectiveMediaItems.filter((item) => item.mediaType === 'image');
  const videos = effectiveMediaItems.filter((item) => item.mediaType === 'video');
  const [activeMediaIndex, setActiveMediaIndex] = useState(null);
  const carouselImages = images.slice(0, 4);

  if (effectiveMediaItems.length === 0) return null;

  return (
    <div className="space-y-4">
      {carouselImages.length > 0 && (
        <div className="relative mx-auto aspect-[16/9] min-h-64 max-h-[36rem] w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-md">
          <MediaCarousel
            items={carouselImages}
            alt={`${programme.title} programme`}
            className="h-full w-full"
            imageClassName="h-full w-full object-cover"
            interval={3500}
            autoPlay
            onImageError={handleImageFallback}
            onMediaClick={(index) => {
              const mediaIndex = effectiveMediaItems.findIndex(
                (item) => item.url === carouselImages[index]?.url
              );
              setActiveMediaIndex(mediaIndex >= 0 ? mediaIndex : 0);
            }}
          />
          {effectiveMediaItems.length > 1 && (
            <button
              type="button"
              onClick={() => setActiveMediaIndex(0)}
              className="absolute right-3 top-3 z-20 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              View all media
            </button>
          )}
        </div>
      )}
      {videos.map((video) => (
        <div
          key={video.url}
          className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-lg"
        >
          <ViewportVideo
            src={video.url}
            ariaLabel={`${programme.title} programme video`}
            className="aspect-video w-full object-cover"
          />
        </div>
      ))}
      {activeMediaIndex !== null && (
        <MediaGalleryModal
          items={effectiveMediaItems}
          title={programme.title}
          initialIndex={activeMediaIndex}
          onClose={() => setActiveMediaIndex(null)}
        />
      )}
    </div>
  );
}
