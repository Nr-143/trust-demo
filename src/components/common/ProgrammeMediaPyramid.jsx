import { Fragment } from 'react';
import { getProgrammeMediaItems } from '../../services/mediaProcessing';
import { handleImageFallback } from '../../utils/helpers';
import MediaPreview from './MediaPreview';

export default function ProgrammeMediaPyramid({ programme }) {
  const mediaItems = getProgrammeMediaItems(programme);
  const images = mediaItems.filter((item) => item.mediaType === 'image');
  const video = mediaItems.find((item) => item.mediaType === 'video');
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

  if (images.length === 0 && !video) return null;
  if (images.length <= 1 && !video) {
    return (
      <div className="overflow-hidden rounded-2xl bg-stone-100">
        <MediaPreview
          src={images[0]?.url}
          alt={`${programme.title} programme`}
          mediaType="image"
          className="h-full max-h-[34rem] min-h-64 w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl bg-[#F0EEE6] p-4 sm:p-6 lg:p-8">
      {rows.map((row, rowIndex) => (
        <Fragment key={`row-${rowIndex}`}>
          {rowIndex === centerRow && video && (
            <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-lg">
              <video
                src={video.url}
                aria-label={`${programme.title} programme video`}
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
                className="aspect-video w-full object-cover"
              />
            </div>
          )}
          <div
            className="mx-auto grid w-full gap-3 sm:gap-5"
            style={{
              gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
              maxWidth: `min(100%, ${row.length * 12}rem)`,
            }}
          >
            {row.map((image, imageIndex) => (
              <div
                key={`${image.url}-${imageIndex}`}
                className="aspect-[4/3] overflow-hidden rounded-xl bg-stone-200 shadow-md"
              >
                <img
                  src={image.url}
                  alt={`${programme.title} photo ${images.indexOf(image) + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  onError={handleImageFallback}
                />
              </div>
            ))}
          </div>
        </Fragment>
      ))}
      {rows.length === 0 && video && (
        <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-lg">
          <video
            src={video.url}
            aria-label={`${programme.title} programme video`}
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
            className="aspect-video w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
