import { createHash } from 'node:crypto';
import { requireAdmin, sendError } from './_auth.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    await requireAdmin(request);
    const { publicId, mediaType } = request.body || {};
    if (
      typeof publicId !== 'string' ||
      !/^gallery\/[0-9a-f-]{36}$/i.test(publicId) ||
      !['image', 'video'].includes(mediaType)
    ) {
      return response.status(400).json({ error: 'Invalid Cloudinary media reference.' });
    }

    const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = process.env;
    if (!cloudName || !apiKey || !apiSecret) {
      throw Object.assign(new Error('Cloudinary server configuration is missing.'), { status: 500 });
    }

    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');
    const body = new URLSearchParams({ api_key: apiKey, public_id: publicId, timestamp, signature });
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${mediaType}/destroy`,
      { method: 'POST', body }
    );
    const result = await cloudinaryResponse.json();
    if (!cloudinaryResponse.ok || !['ok', 'not found'].includes(result.result)) {
      throw new Error(result.error?.message || 'Cloudinary could not delete this media.');
    }

    return response.status(200).json({ success: true });
  } catch (error) {
    return sendError(response, error);
  }
}
