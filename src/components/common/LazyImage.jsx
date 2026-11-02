import { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import { handleImageFallback } from '../../utils/helpers';

/**
 * LazyImage - High-Performance Smooth Lazy Loader
 *
 * Provides:
 * - Animated shimmer placeholder skeleton while loading (no layout shift / "sheeting")
 * - Smooth CSS fade-in transition on load
 * - Native lazy loading and asynchronous image decoding
 * - Automatic error handling with fallback image
 * - Full responsive touch support
 */
export default function LazyImage({
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  aspectRatio = '',
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset state if image source changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    setIsLoaded(true);
    if (onError) onError(e);
    else handleImageFallback(e);
  };

  return (
    <div
      className={`relative overflow-hidden bg-stone-100 ${aspectRatio ? aspectRatio : ''} ${wrapperClassName}`}
    >
      {/* Animated Skeleton Shimmer (Visible while loading) */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-stone-200/70 animate-pulse pointer-events-none">
          <div className="flex flex-col items-center gap-1.5 opacity-30 text-stone-500">
            <ImageIcon size={22} className="animate-bounce" />
          </div>
          {/* Shimmer light sweep */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      )}

      {/* Main Image with Smooth Fade-In */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} transition-opacity duration-500 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
}
