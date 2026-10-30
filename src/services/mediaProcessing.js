const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_INPUT_BYTES = 50 * 1024 * 1024;
const MAX_VIDEO_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_INPUT_BYTES = 100 * 1024 * 1024;

export function getGalleryMediaType(file) {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const fileType = file.type || ({
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    mp4: 'video/mp4',
    webm: 'video/webm',
  }[fileExtension]);
  if (IMAGE_TYPES.has(fileType)) return 'image';
  if (VIDEO_TYPES.has(fileType)) return 'video';
  return null;
}

export function getMediaTypeFromUrl(url) {
  if (!url) return 'image';
  return /\/video\/upload\/|\.mp4(?:$|[?#])|\.webm(?:$|[?#])/i.test(url) ? 'video' : 'image';
}

export function getProgrammeMediaItems(programme) {
  const rawGallery = programme?.mediaGallery || programme?.media_gallery;
  const mediaGallery = Array.isArray(rawGallery)
    ? rawGallery.filter((item) => item?.url)
    : [];
  const imageUrl = programme?.imageUrl || programme?.image_url;
  const imageGallery = mediaGallery.some((item) => item.mediaType === 'image');
  const fallbackImage = imageUrl
    && getMediaTypeFromUrl(imageUrl) === 'image'
    && !mediaGallery.some((item) => item.url === imageUrl)
    ? [{
        url: imageUrl,
        mediaType: 'image',
        publicId: programme?.cloudinaryPublicId || programme?.cloudinary_public_id || null,
      }]
    : [];
  return [...mediaGallery, ...(!imageGallery ? fallbackImage : [])];
}

function canvasToWebp(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Could not convert the image to WebP.'));
      },
      'image/webp',
      quality
    );
  });
}

async function compressImage(file) {
  if (file.size > MAX_IMAGE_INPUT_BYTES) {
    throw new Error('Choose an image smaller than 50 MB before compression.');
  }
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    for (const maxDimension of [1920, 1600, 1280, 1024]) {
      const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image processing is unavailable in this browser.');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.86, 0.75, 0.64, 0.52, 0.4]) {
        const blob = await canvasToWebp(canvas, quality);
        if (blob.size <= MAX_IMAGE_BYTES) {
          return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', {
            type: 'image/webp',
            lastModified: Date.now(),
          });
        }
      }
    }
  } finally {
    bitmap?.close();
  }
  throw new Error('This image cannot be compressed below the 2 MB limit.');
}

let ffmpegPromise;

async function loadFfmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const ffmpeg = new FFmpeg();
      const coreBase = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      const toBlobURL = async (url, mimeType) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Could not load video encoder (${response.status}).`);
        return URL.createObjectURL(new Blob([await response.arrayBuffer()], { type: mimeType }));
      };
      const coreURL = await toBlobURL(`${coreBase}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${coreBase}/ffmpeg-core.wasm`, 'application/wasm');
      try {
        await ffmpeg.load({ coreURL, wasmURL });
      } finally {
        URL.revokeObjectURL(coreURL);
        URL.revokeObjectURL(wasmURL);
      }
      return ffmpeg;
    })().catch((error) => {
      ffmpegPromise = null;
      throw error;
    });
  }
  return ffmpegPromise;
}

async function compressVideo(file) {
  if (file.size > MAX_VIDEO_INPUT_BYTES) {
    throw new Error('Choose a video smaller than 100 MB before compression.');
  }
  const isMp4 = file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4');

  // If the video is already an MP4 under 5 MB, upload directly without heavy client-side transcoding
  if (isMp4 && file.size <= MAX_VIDEO_BYTES) {
    return file;
  }

  let ffmpeg;
  try {
    ffmpeg = await loadFfmpeg();
  } catch (loadErr) {
    console.warn('[MediaProcessing] Could not load browser FFmpeg encoder:', loadErr);
    // If it is already an MP4 under 20 MB, allow direct upload to Cloudinary (which optimizes in the cloud)
    if (isMp4 && file.size <= 20 * 1024 * 1024) {
      return file;
    }
    throw new Error(
      `Could not initialize video compressor in this browser (${loadErr.message || 'worker error'}). Please provide an MP4 video under 5 MB to upload directly.`
    );
  }
  const inputName = `input-${Date.now()}.${file.type === 'video/webm' || file.name.toLowerCase().endsWith('.webm') ? 'webm' : 'mp4'}`;
  const outputName = `output-${Date.now()}.mp4`;
  await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));

  try {
    for (const [width, crf] of [[1280, 30], [960, 34], [720, 38], [640, 42]]) {
      await ffmpeg.exec([
        '-y',
        '-i', inputName,
        '-vf', `scale='min(${width},iw)':-2`,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', String(crf),
        '-c:a', 'aac',
        '-b:a', '96k',
        '-movflags', '+faststart',
        outputName,
      ]);
      const data = await ffmpeg.readFile(outputName);
      if (data.length <= MAX_VIDEO_BYTES) {
        const compressedFile = new File([data], file.name.replace(/\.[^.]+$/, '') + '.mp4', {
          type: 'video/mp4',
          lastModified: Date.now(),
        });
        await ffmpeg.deleteFile(outputName);
        return compressedFile;
      }
      await ffmpeg.deleteFile(outputName);
    }
  } finally {
    await ffmpeg.deleteFile(inputName);
  }
  throw new Error('This video cannot be compressed below the 5 MB limit.');
}

export async function processGalleryMedia(file) {
  const mediaType = getGalleryMediaType(file);
  if (mediaType === 'image') return { file: await compressImage(file), mediaType };
  if (mediaType === 'video') return { file: await compressVideo(file), mediaType };
  throw new Error('Unsupported file format. Choose JPEG, PNG, WebP, MP4, or WebM.');
}
