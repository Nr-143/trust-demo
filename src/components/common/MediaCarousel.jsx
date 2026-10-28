import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaPreview from './MediaPreview';

export default function MediaCarousel({
  items,
  alt,
  className,
  imageClassName,
  interval = 4500,
  onImageError,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const mediaItems = Array.isArray(items) ? items.filter((item) => item?.url) : [];
  const safeIndex = mediaItems.length > 0 ? activeIndex % mediaItems.length : 0;

  useEffect(() => {
    setActiveIndex(0);
  }, [mediaItems.length]);

  useEffect(() => {
    if (mediaItems.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % mediaItems.length);
    }, interval);
    return () => window.clearInterval(timer);
  }, [interval, mediaItems.length]);

  if (mediaItems.length === 0) return null;

  const changeSlide = (direction) => {
    setActiveIndex((index) => (index + direction + mediaItems.length) % mediaItems.length);
  };
  const activeMedia = mediaItems[safeIndex];

  return (
    <div
      className={`group relative overflow-hidden ${className || ''}`}
      aria-roledescription="carousel"
      aria-label={`${alt} image carousel`}
    >
      <MediaPreview
        key={activeMedia.url}
        src={activeMedia.url}
        mediaType="image"
        alt={`${alt} photo ${safeIndex + 1} of ${mediaItems.length}`}
        className={imageClassName || 'h-full w-full object-cover'}
        loading="lazy"
        onImageError={onImageError}
      />
      {mediaItems.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => changeSlide(-1)}
            aria-label="Previous programme image"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white opacity-100 transition-opacity hover:bg-black/75 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => changeSlide(1)}
            aria-label="Next programme image"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white opacity-100 transition-opacity hover:bg-black/75 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5">
            {mediaItems.map((item, index) => (
              <button
                key={`${item.url}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show programme image ${index + 1}`}
                aria-current={index === safeIndex ? 'true' : undefined}
                className={`h-2 rounded-full transition-all ${
                  index === safeIndex ? 'w-5 bg-white' : 'w-2 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
          <span className="absolute right-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold text-white">
            {safeIndex + 1} / {mediaItems.length}
          </span>
        </>
      )}
    </div>
  );
}
