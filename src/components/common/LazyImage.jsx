import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageIcon } from 'lucide-react';

/**
 * LazyImage - High-Performance Smooth Lazy Loader
 *
 * Provides:
 * - Instant cache detection via callback ref (prevents cached images from getting stuck in loading state)
 * - Animated shimmer placeholder skeleton while loading (no layout shift / "sheeting")
 * - Smooth CSS fade-in transition on load
 * - Fallback protection via state without breaking React DOM reconciliation
 * - Eager loading support for above-the-fold hero images so they never flash or disappear
 */
export default function LazyImage({
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  aspectRatio = '',
  loading = 'lazy',
  fallbackSrc = '/images/originalLogo.jpeg',
  onLoad,
  onError,
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [isLoaded, setIsLoaded] = useState(loading === 'eager');
  const [hasError, setHasError] = useState(false);

  const imgRef = useRef(null);
  const prevSrcRef = useRef(src);

  // Sync with prop only when src actually changes
  useEffect(() => {
    if (prevSrcRef.current !== src) {
      prevSrcRef.current = src;
      setCurrentSrc(src || fallbackSrc);
      setHasError(false);

      if (loading === 'eager' || (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0)) {
        setIsLoaded(true);
      } else {
        setIsLoaded(false);
      }
    } else if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src, fallbackSrc, loading]);

  // Callback ref checks if image is already loaded from browser cache upon DOM attachment
  const onImgRef = useCallback((node) => {
    imgRef.current = node;
    if (node && (loading === 'eager' || (node.complete && node.naturalWidth > 0))) {
      setIsLoaded(true);
    }
  }, [loading]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    if (!hasError) {
      setHasError(true);
      const fallback = fallbackSrc || '/images/originalLogo.jpeg';
      setCurrentSrc(fallback);
      setIsLoaded(true);
    }
    if (onError) onError(e);
  };

  const isVisible = isLoaded || hasError || loading === 'eager';

  return (
    <div
      className={`relative overflow-hidden bg-stone-100 ${aspectRatio ? aspectRatio : ''} ${wrapperClassName}`}
    >
      {/* Animated Skeleton Shimmer (Visible only while loading) */}
      {!isVisible && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-stone-200/70 animate-pulse pointer-events-none">
          <div className="flex flex-col items-center gap-1.5 opacity-30 text-stone-500">
            <ImageIcon size={22} className="animate-bounce" />
          </div>
          {/* Shimmer light sweep */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      )}

      {/* Main Image with Smooth Fade-In */}
      <img
        ref={onImgRef}
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} relative z-10 transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
}
