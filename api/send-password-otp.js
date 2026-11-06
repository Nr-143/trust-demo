import { requireAdmin, sendError } from './_auth.js';
import { createChallenge, getOtpConfig, sendOtpEmail } from './_passwordOtp.js';

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

    const recipient = config.recipient || user.email;
    if (!recipient) {
      throw Object.assign(
        new Error('No OTP recipient is configured. Set OTP_RECIPIENT_EMAIL or use an admin account with an email address.'),
        { status: 400 }
      );
    }

    const { code, challenge, expiresAt } = createChallenge(config, user);
    await sendOtpEmail(config, {
      to: recipient,
      code,
      adminEmail: user.email,
      expiresAt,
    });

    return response.status(200).json({
      channel: 'smtp',
      recipient,
      challenge,
      expiresAt,
      otpLength: config.length,
    });
  } catch (error) {
    return sendError(response, error, {
      tag: '[Password OTP]',
      exposeMessage: true,
      message: 'Could not send the verification code.',
    });
  }
}
