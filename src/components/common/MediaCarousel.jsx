import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Film } from 'lucide-react';
import { getMediaTypeFromUrl } from '../../services/mediaProcessing';
import ViewportVideo from './ViewportVideo';

export default function MediaCarousel({
  items,
  alt,
  className,
  imageClassName,
  interval = 3500,
  onImageError,
  onMediaClick,
  autoPlay = true,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize items to { url, mediaType }
  const mediaItems = Array.isArray(items)
    ? items
        .map((item) => {
          if (!item) return null;
          if (typeof item === 'string') {
            return { url: item, mediaType: getMediaTypeFromUrl(item) };
          }
          return {
            url: item.url,
            mediaType: item.mediaType || getMediaTypeFromUrl(item.url),
          };
        })
        .filter((item) => item?.url)
    : [];

  const safeIndex = mediaItems.length > 0 ? activeIndex % mediaItems.length : 0;
  const activeMedia = mediaItems[safeIndex];

  useEffect(() => {
    setActiveIndex(0);
  }, [mediaItems.length]);

  // Auto-play scroll interval
  useEffect(() => {
    if (!autoPlay || mediaItems.length < 2 || isHovered) return undefined;

    // If currently showing a video, let the user watch or advance with slightly longer interval
    const stepInterval = activeMedia?.mediaType === 'video' ? Math.max(interval, 8000) : interval;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % mediaItems.length);
    }, stepInterval);

    return () => window.clearInterval(timer);
  }, [autoPlay, interval, mediaItems.length, isHovered, activeMedia?.mediaType]);

  if (mediaItems.length === 0 || !activeMedia) return null;

  const changeSlide = (e, direction) => {
    e.stopPropagation();
    setActiveIndex((index) => (index + direction + mediaItems.length) % mediaItems.length);
  };

  const isVideo = activeMedia.mediaType === 'video';

  return (
    <div
      className={`group relative overflow-hidden select-none ${className || ''}`}
      aria-roledescription="carousel"
      aria-label={`${alt} media carousel`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Active Media Rendering */}
      <div
        className={`h-full w-full ${onMediaClick && !isVideo ? 'cursor-pointer' : ''}`}
        onClick={() => onMediaClick && onMediaClick(safeIndex)}
      >
        {isVideo ? (
          <div className="relative h-full w-full bg-black flex items-center justify-center">
            <ViewportVideo
              src={activeMedia.url}
              ariaLabel={`${alt} video`}
              className={imageClassName || 'h-full w-full object-contain'}
              autoPlay={true}
              loop={true}
              muted={true}
              playsInline={true}
              controls={true}
            />
            <span className="absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-xs text-white flex items-center gap-1 pointer-events-none">
              <Film size={11} />
              <span>Video</span>
            </span>
          </div>
        ) : (
          <img
            key={activeMedia.url}
            src={activeMedia.url}
            alt={`${alt} photo ${safeIndex + 1} of ${mediaItems.length}`}
            className={imageClassName || 'h-full w-full object-cover transition-opacity duration-300'}
            loading="lazy"
            onError={onImageError}
          />
        )}
      </div>

      {/* Navigation & Counter (only when multiple items exist) */}
      {mediaItems.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            type="button"
            onClick={(e) => changeSlide(e, -1)}
            aria-label="Previous item"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/60 p-2 text-white shadow-md backdrop-blur-xs opacity-80 sm:opacity-0 transition-opacity hover:bg-black/85 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={(e) => changeSlide(e, 1)}
            aria-label="Next item"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/60 p-2 text-white shadow-md backdrop-blur-xs opacity-80 sm:opacity-0 transition-opacity hover:bg-black/85 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <ChevronRight size={16} />
          </button>

          {/* Indicators Bar */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-xs pointer-events-auto">
            {mediaItems.map((item, index) => (
              <button
                key={`${item.url}-${index}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(index);
                }}
                aria-label={`Show slide ${index + 1}`}
                aria-current={index === safeIndex ? 'true' : undefined}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  index === safeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          {/* Item Counter Pill */}
          <span className="absolute bottom-3 right-3 z-20 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-white pointer-events-none">
            {safeIndex + 1} / {mediaItems.length}
          </span>
        </>
      )}
    </div>
  );
}
