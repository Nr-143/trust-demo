import { Fragment, useState } from 'react';
import { getProgrammeMediaItems } from '../../services/mediaProcessing';
import { handleImageFallback } from '../../utils/helpers';
import MediaPreview from './MediaPreview';
import LazyImage from './LazyImage';
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
  const rows = [];
  let offset = 0;
  let rowSize = 1;

  while (offset < images.length) {
    const rowImages = images.slice(offset, offset + rowSize);
    rows.push(rowImages);
    offset += rowImages.length;
    rowSize += 2;
  }

  const centerRow = Math.floor(rows.length / 2);

  if (effectiveMediaItems.length === 0) return null;
  if (images.length <= 1 && videos.length === 0) {
    const primaryImgUrl = images[0]?.url || programme?.imageUrl || programme?.image_url;
    return (
      <>
        <button
          type="button"
          onClick={() => setActiveMediaIndex(0)}
          aria-label={`View photo for ${programme.title}`}
          className="group block w-full overflow-hidden rounded-2xl bg-stone-900/5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36] border border-stone-200"
        >
          <div className="relative w-full max-h-[36rem] min-h-64 sm:min-h-80 flex items-center justify-center bg-stone-100 overflow-hidden">
            <MediaPreview
              src={primaryImgUrl}
              alt={`${programme.title} programme`}
              mediaType="image"
              className="w-full h-auto max-h-[36rem] object-contain sm:object-cover transition-transform duration-300 group-hover:scale-101"
              onImageError={handleImageFallback}
            />
          </div>
        </button>
        {activeMediaIndex !== null && (
          <MediaGalleryModal
            items={effectiveMediaItems}
            title={programme.title}
            initialIndex={activeMediaIndex}
            onClose={() => setActiveMediaIndex(null)}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl bg-[#F0EEE6] p-4 sm:p-6 lg:p-8">
      {rows.map((row, rowIndex) => (
        <Fragment key={`row-${rowIndex}`}>
          {rowIndex === centerRow &&
            videos.map((video) => (
              <div
                key={video.url}
                className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-lg"
              >
                <ViewportVideo
                  src={video.url}
                  ariaLabel={`${programme.title} programme video`}
                  className="aspect-video w-full object-cover"
                />
              </div>
            ))}
          <div
            className="mx-auto grid w-full gap-3 sm:gap-5"
            style={{
              gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
              maxWidth: `min(100%, ${row.length * 12}rem)`,
            }}
          >
            {row.map((image, imageIndex) => (
              <button
                key={`${image.url}-${imageIndex}`}
                type="button"
                onClick={() => setActiveMediaIndex(mediaItems.indexOf(image))}
                aria-label={`View photo ${images.indexOf(image) + 1} of ${programme.title}`}
                className="aspect-[4/3] overflow-hidden rounded-xl bg-stone-200 shadow-md"
              >
                <LazyImage
                  src={image.url}
                  alt={`${programme.title} photo ${images.indexOf(image) + 1}`}
                  className="h-full w-full object-cover"
                  wrapperClassName="h-full w-full"
                  onError={handleImageFallback}
                />
              </button>
            ))}
          </div>
        </Fragment>
      ))}
      {rows.length === 0 && videos.map((video) => (
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
          items={mediaItems}
          title={programme.title}
          initialIndex={activeMediaIndex}
          onClose={() => setActiveMediaIndex(null)}
        />
      )}
    </div>
  );
}
