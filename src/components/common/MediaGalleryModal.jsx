import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Film, X } from 'lucide-react';
import { getMediaTypeFromUrl } from '../../services/mediaProcessing';
import { handleImageFallback } from '../../utils/helpers';
import ViewportVideo from './ViewportVideo';

export default function MediaGalleryModal({ items, title, initialIndex = 0, onClose }) {
  const mediaItems = Array.isArray(items) ? items.filter((item) => item?.url) : [];
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const safeIndex = mediaItems.length ? activeIndex % mediaItems.length : 0;
  const activeItem = mediaItems[safeIndex];

  useEffect(() => {
    setActiveIndex(Math.min(initialIndex, Math.max(mediaItems.length - 1, 0)));
  }, [initialIndex, mediaItems.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (mediaItems.length > 1 && event.key === 'ArrowLeft') {
        setActiveIndex((index) => (index - 1 + mediaItems.length) % mediaItems.length);
      }
      if (mediaItems.length > 1 && event.key === 'ArrowRight') {
        setActiveIndex((index) => (index + 1) % mediaItems.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mediaItems.length, onClose]);

  if (!activeItem) return null;

  const isVideo = activeItem.mediaType === 'video' || getMediaTypeFromUrl(activeItem.url) === 'video';
  const isYouTube =
    activeItem.url.includes('youtube.com') || activeItem.url.includes('youtu.be');
  const changeIndex = (direction) => {
    setActiveIndex((index) => (index + direction + mediaItems.length) % mediaItems.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} media gallery`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-stone-700 bg-stone-950 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-stone-800 px-4 py-3 text-white sm:px-5">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{title}</h2>
            <p className="mt-0.5 text-xs text-stone-400">
              {isVideo ? 'Video' : 'Photo'} {safeIndex + 1} of {mediaItems.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media gallery"
            className="shrink-0 rounded-lg p-2 text-stone-300 transition-colors hover:bg-stone-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <X size={19} />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black p-3 sm:p-5">
          {isVideo ? (
            isYouTube ? (
              <iframe
                key={activeItem.url}
                src={activeItem.url}
                title={`${title} video ${safeIndex + 1}`}
                className="aspect-video max-h-[65vh] w-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <ViewportVideo
                key={activeItem.url}
                src={activeItem.url}
                ariaLabel={`${title} video ${safeIndex + 1}`}
                className="max-h-[65vh] w-full rounded-lg object-contain"
              />
            )
          ) : (
            <img
              key={activeItem.url}
              src={activeItem.url}
              alt={`${title} photo ${safeIndex + 1}`}
              className="max-h-[65vh] max-w-full object-contain"
              onError={handleImageFallback}
            />
          )}

          {mediaItems.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => changeIndex(-1)}
                aria-label="Previous media"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/65 p-2.5 text-white hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => changeIndex(1)}
                aria-label="Next media"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/65 p-2.5 text-white hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {mediaItems.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-stone-800 bg-stone-950 p-3">
            {mediaItems.map((item, index) => {
              const itemIsVideo =
                item.mediaType === 'video' || getMediaTypeFromUrl(item.url) === 'video';
              return (
                <button
                  key={`${item.url}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show ${itemIsVideo ? 'video' : 'photo'} ${index + 1}`}
                  aria-current={index === safeIndex ? 'true' : undefined}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 bg-stone-800 ${
                    index === safeIndex ? 'border-emerald-400' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  {itemIsVideo ? (
                    <div className="flex h-full items-center justify-center text-white">
                      <Film size={20} />
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={handleImageFallback}
                    />
                  )}
                  <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[10px] text-white">
                    {index + 1}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <div className="border-t border-stone-800 px-4 py-2 text-right text-[11px] text-stone-500">
          Use arrow keys to browse. Press ESC to close.
        </div>
      </div>
    </div>
  );
}
