import { Fragment, useState } from 'react';
import { getProgrammeMediaItems } from '../../services/mediaProcessing';
import { handleImageFallback } from '../../utils/helpers';
import MediaPreview from './MediaPreview';
import MediaGalleryModal from './MediaGalleryModal';
import ViewportVideo from './ViewportVideo';

export default function ProgrammeMediaPyramid({ programme }) {
  const mediaItems = getProgrammeMediaItems(programme);
  const images = mediaItems.filter((item) => item.mediaType === 'image');
  const videos = mediaItems.filter((item) => item.mediaType === 'video');
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

  if (mediaItems.length === 0) return null;
  if (images.length <= 1 && videos.length === 0) {
    return (
      <>
        <button
          type="button"
          onClick={() => setActiveMediaIndex(0)}
          aria-label={`View photo for ${programme.title}`}
          className="block w-full overflow-hidden rounded-2xl bg-stone-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B36]"
        >
          <MediaPreview
            src={images[0]?.url}
            alt={`${programme.title} programme`}
            mediaType="image"
            className="h-full max-h-[34rem] min-h-64 w-full object-cover"
            onImageError={handleImageFallback}
          />
        </button>
        {activeMediaIndex !== null && (
          <MediaGalleryModal
            items={mediaItems}
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
                <img
                  src={image.url}
                  alt={`${programme.title} photo ${images.indexOf(image) + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
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
