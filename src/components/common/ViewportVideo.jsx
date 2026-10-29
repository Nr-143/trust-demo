import { useEffect, useRef } from 'react';

export default function ViewportVideo({ src, ariaLabel, className }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === 'undefined') return undefined;

    video.muted = true;
    video.defaultMuted = true;
    let isInView = false;

    const playIfVisible = () => {
      if (!isInView || document.hidden) return;
      video.muted = true;
      video.play().catch((error) => {
        if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
          console.warn('[ViewportVideo] Could not start video playback:', error);
        }
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting && entry.intersectionRatio >= 0.5;
        if (isInView) {
          playIfVisible();
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.5, 1] }
    );

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else {
        playIfVisible();
      }
    };

    observer.observe(video);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      video.pause();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      aria-label={ariaLabel}
      controls
      muted
      playsInline
      preload="metadata"
      className={className}
    >
      Your browser does not support the video tag.
    </video>
  );
}
