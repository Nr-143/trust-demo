import { getMediaTypeFromUrl } from '../../services/mediaProcessing';

export default function MediaPreview({
  src,
  alt,
  className,
  mediaType,
  controls = false,
  onImageError,
  loading,
}) {
  if (!src) return null;

  if ((mediaType || getMediaTypeFromUrl(src)) === 'video') {
    return (
      <video
        src={src}
        aria-label={alt}
        controls={controls}
        muted={!controls}
        playsInline
        preload="metadata"
        className={className}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={onImageError}
    />
  );
}
