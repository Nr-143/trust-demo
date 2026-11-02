import { useState } from 'react';
import { Play, Film } from 'lucide-react';
import { getMediaTypeFromUrl } from '../../services/mediaProcessing';
import { handleImageFallback } from '../../utils/helpers';

export default function MediaPreview({
  src,
  alt = '',
  className = '',
  mediaType,
  controls = false,
  showPlayOverlay = true,
  onImageError,
  loading = 'lazy',
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const isVideo = (mediaType || getMediaTypeFromUrl(src)) === 'video';

  if (!src) return null;

  if (isVideo) {
    return (
      <div className={`relative overflow-hidden bg-stone-900 group ${className.includes('rounded') ? '' : 'rounded-lg'}`}>
        {/* Animated Skeleton shimmer while video loads */}
        {!isLoaded && (
          <div className="absolute inset-0 z-0 bg-stone-800 animate-pulse flex items-center justify-center">
            <Film className="w-6 h-6 text-stone-600 animate-bounce" />
          </div>
        )}

        <video
          src={src}
          aria-label={alt}
          controls={controls}
          muted={!controls}
          playsInline
          preload="metadata"
          onLoadedData={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        />

        {/* High-Visibility Play Button Overlay */}
        {!controls && showPlayOverlay && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-black/25 group-hover:bg-black/40 transition-colors">
            {/* Center Circular Play Button */}
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:bg-[#176B36] group-hover:border-emerald-400 transition-all">
              <Play size={20} className="fill-white translate-x-0.5" />
            </div>

            {/* Corner Video Pill Badge */}
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-xs text-white border border-white/20 flex items-center gap-1 shadow-sm">
              <Film size={11} />
              <span>Video</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${className.includes('rounded') ? '' : ''}`}>
      {/* Animated Skeleton Shimmer (prevents sheeting/jarring layout jump) */}
      {!isLoaded && (
        <div className="absolute inset-0 z-0 bg-stone-200/80 animate-pulse pointer-events-none" />
      )}

      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          setIsLoaded(true);
          if (onImageError) onImageError(e);
          else handleImageFallback(e);
        }}
        className={`${className} transition-opacity duration-500 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
