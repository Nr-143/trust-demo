# trust-demo

## Gallery media uploads

Gallery uploads are converted in the browser before they reach Cloudinary: JPEG,
PNG, and WebP images become WebP files up to 2 MB; MP4 and WebM videos are
transcoded to MP4 files up to 5 MB. Source images must be under 50 MB and source
videos under 100 MB. The browser uploads the processed media directly to
Cloudinary. An authenticated Vercel function only signs the upload request, and
another handles deletion; the Cloudinary API secret must never use a `VITE_`
environment variable.

Configure these server environment variables in Vercel (and in `.env` when
running Vercel's local development server):

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` (or `SUPABASE_ANON_KEY`)

Run the updated `supabase/schema.sql` in the Supabase SQL Editor to add
`media_type` and `cloudinary_public_id` to existing gallery tables. Start the
app with `npm run dev:cloudinary` when testing uploads locally; unlike the
Vite-only `npm run dev`, this also runs the authenticated API functions under
`api/`.
