import { createHash, randomUUID } from 'node:crypto';
import { requireAdmin, sendError } from './_auth.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    await requireAdmin(request);
    const { mediaType } = request.body || {};
    if (!['image', 'video'].includes(mediaType)) {
      return response.status(400).json({ error: 'Unsupported media type.' });
    }

    const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = process.env;
    if (!cloudName || !apiKey || !apiSecret) {
      throw Object.assign(new Error('Cloudinary server configuration is missing.'), { status: 500 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `gallery/${randomUUID()}`;
    const allowedFormats = mediaType === 'image' ? 'webp' : 'mp4';
    const params = {
      allowed_formats: allowedFormats,
      overwrite: 'false',
      public_id: publicId,
      timestamp: String(timestamp),
    };
    const signatureSource = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');
    const signature = createHash('sha1')
      .update(`${signatureSource}${apiSecret}`)
      .digest('hex');

    return response.status(200).json({
      apiKey,
      cloudName,
      publicId,
      resourceType: mediaType,
      signature,
      timestamp,
      allowedFormats,
    });
  } catch (error) {
    return sendError(response, error);
  }
}
