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

## Admin session rules

Admin sessions expire automatically 24 hours after sign-in, and only one admin
session may be active at a time. When a new administrator signs in (in another
tab, browser, or device), the older session is signed out.

Run the updated `supabase/schema.sql` to create the `admin_active_session`
table and its policies. Without that table the app still enforces the 24-hour
limit and single-session rule within the same browser, but cross-device
sign-out requires the table.

## Admin password change with email OTP

The admin Settings page includes an **Admin Password** card. The password is
always changed on the signed-in admin's Supabase account; only the delivery
address of the verification code is configurable.

### SMTP delivery (configurable recipient)

When `SMTP_HOST` is set, `Send OTP to Email` calls the authenticated
`/api/send-password-otp` route. The route:

1. Generates a numeric code and signs it into a short-lived challenge.
2. Emails the code through your SMTP server to `OTP_RECIPIENT_EMAIL`. If that
   value is blank it uses the signed-in admin's email.
3. Verifies the code with `/api/verify-password-otp` when the admin submits it.

Only after the code is accepted does the app call
`supabase.auth.updateUser({ password })` with the current admin session. This
lets you send OTPs to a mailbox you control for testing while the admin account
keeps its own address.

Configure these **server-side** variables in `.env` for
`npm run dev:cloudinary` and in Vercel for production (never prefix them with
`VITE_`, or the values will be exposed to the browser):

- `SMTP_HOST` - SMTP server hostname. Leave blank to use the Supabase fallback.
- `SMTP_PORT` - defaults to `587` (`465` when `SMTP_SECURE=true`).
- `SMTP_SECURE` - `true` for implicit TLS (usually port 465), otherwise `false`.
- `SMTP_USER` / `SMTP_PASS` - SMTP credentials.
- `SMTP_FROM` - sender address; defaults to `SMTP_USER`.
- `SMTP_FROM_NAME` - sender display name.
- `OTP_RECIPIENT_EMAIL` - mailbox that receives the code. Use your own address
  here while testing. Leave blank to use the admin account email.
- `OTP_SECRET` - signs the challenge; defaults to `SMTP_PASS` when blank.
- `OTP_LENGTH` - number of digits, 6 to 10 (default `6`).
- `OTP_EXPIRY_MINUTES` - default `10`.
- `OTP_EMAIL_SUBJECT` - subject line for the OTP email.

Run `npm run dev:cloudinary` when testing locally; plain `npm run dev` does not
run `/api` routes, so the app falls back to Supabase email OTP.

### Supabase fallback

When `SMTP_HOST` is blank, or the `/api` routes are unavailable, the flow is:

1. `Send OTP to Email` calls `supabase.auth.signInWithOtp()` for the signed-in
   admin's email (no new users are created).
2. The admin enters the one-time code and the new password.
3. The app calls `supabase.auth.verifyOtp()` first, then updates the password
   with `supabase.auth.updateUser({ password })`.

Supabase stores the password hashed; this app never stores, logs, or sends the
plaintext password anywhere except to Supabase Auth.

#### Supabase setup (for the fallback flow)

1. **Email provider**: Authentication &rarr; Providers &rarr; Email must be
   enabled, and the admin user must have a confirmed email address.
2. **OTP email template**: Authentication &rarr; Email Templates (or Emails
   &rarr; Templates) &rarr; **Magic Link**. Replace `{{ .ConfirmationURL }}`
   with `{{ .Token }}` so the email contains a numeric OTP instead of a link.
   Example body:

   ```html
   <h2>Admin password verification</h2>
   <p>Your one-time password is:</p>
   <p style="font-size: 28px; letter-spacing: 6px; font-weight: 700;">{{ .Token }}</p>
   <p>This code expires shortly. If you did not request it, ignore this email.</p>
   ```

3. **OTP length and expiry**: Authentication &rarr; Providers &rarr; Email
   (or Authentication &rarr; Settings) &rarr; set the email OTP length and
   expiry. The UI accepts 6 to 10 numeric digits.
4. **Sending limits / SMTP**: Authentication &rarr; Rate Limits controls email
   sends, and Authentication &rarr; Settings &rarr; SMTP can be configured
   with your provider. The default Supabase mailer is heavily rate-limited and
   is not suitable for production. A per-user resend cooldown of 60 seconds is
   built into the UI.
5. **Receiving address**: In the fallback flow the code always goes to the
   currently signed-in admin's email. To change it, update the user's email in
   Authentication &rarr; Users (or through the Supabase Admin API).
