import { requireAdmin, sendError } from './_auth.js';
import { getOtpConfig, verifyChallenge } from './_passwordOtp.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { user } = await requireAdmin(request);
    const config = getOtpConfig();
    if (!config) {
      return response.status(501).json({
        error: 'SMTP OTP delivery is not configured.',
        code: 'SMTP_NOT_CONFIGURED',
      });
    }

    if (!config.secret) {
      throw Object.assign(
        new Error('OTP_SECRET or SMTP_PASS must be set to sign the verification code.'),
        { status: 500 }
      );
    }

    const { challenge, otp } = request.body || {};
    verifyChallenge(config, challenge, otp, user.id);

    return response.status(200).json({ success: true });
  } catch (error) {
    return sendError(response, error, {
      tag: '[Password OTP]',
      exposeMessage: true,
      message: 'Could not verify the code.',
    });
  }
}
