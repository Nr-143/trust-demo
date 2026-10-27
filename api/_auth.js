import { createClient } from '@supabase/supabase-js';

export async function requireAdmin(request) {
  const authorization = request.headers.authorization || '';
  const accessToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) throw Object.assign(new Error('Administrator sign-in is required.'), { status: 401 });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw Object.assign(new Error('Server Supabase configuration is missing.'), { status: 500 });
  }

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data: userData, error: userError } = await client.auth.getUser(accessToken);
  if (userError || !userData.user) {
    throw Object.assign(new Error('Administrator sign-in has expired.'), { status: 401 });
  }

  const { data: isAdmin, error: adminError } = await client.rpc('is_admin');
  if (adminError) throw Object.assign(new Error('Could not verify administrator access.'), { status: 403 });
  if (!isAdmin) throw Object.assign(new Error('Administrator access is required.'), { status: 403 });
}

export function sendError(response, error) {
  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status === 500) console.error('[Cloudinary API]', error);
  response.status(status).json({ error: status === 500 ? 'Media operation failed.' : error.message });
}
