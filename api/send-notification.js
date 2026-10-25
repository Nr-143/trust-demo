/**
 * Vercel Serverless Function: api/send-notification.js
 * 
 * Secure server-side notification dispatcher for Mannin Maindhan Grama Arakkattalai.
 * Dispatches automated email alerts to the NGO's confirmed inbox (sonofsoiltrust@gmail.com)
 * when new contact enquiries, volunteer applications, or job applications are submitted.
 *
 * Security:
 * - RESEND_API_KEY is accessed exclusively in Node.js runtime (server-side secrets)
 * - Never exposed to client bundles or browser console
 * - Graceful fallback when the email service key has not yet been set up in Vercel
 */

export default async function handler(req, res) {
  // CORS handling
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { type, record } = req.body || {};

    if (!type || !record) {
      return res.status(400).json({ error: 'Missing required parameters: type and record.' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const recipientEmail = process.env.NOTIFICATION_RECIPIENT_EMAIL || 'sonofsoiltrust@gmail.com';
    const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || 'Mannin Maindhan Notifications <onboarding@resend.dev>';

    // If email API key is not configured yet in Vercel secrets, return informative status
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not configured in environment. Skipping email dispatch.');
      return res.status(200).json({
        success: false,
        warning: 'Email provider key (RESEND_API_KEY) is not yet set in environment secrets.',
        recipient: recipientEmail,
      });
    }

    // Build subject and HTML template based on submission type
    let subject = '';
    let detailsHtml = '';

    if (type === 'contact_enquiry') {
      subject = `[New Contact Enquiry] ${record.subject || 'Website Message'} - from ${record.name}`;
      detailsHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 12px; background: #fafaf9;">
          <h2 style="color: #14532d; margin-top: 0;">New Contact Enquiry Received</h2>
          <p style="color: #57534e; font-size: 14px;">A new message was submitted via the Mannin Maindhan Grama Arakkattalai contact form:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e7e5e4;">
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; width: 30%; color: #44403c;">Name</td><td style="padding: 10px 14px; color: #1c1917;">${record.name}</td></tr>
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; color: #44403c;">Email</td><td style="padding: 10px 14px; color: #1c1917;"><a href="mailto:${record.email}" style="color: #15803d;">${record.email}</a></td></tr>
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; color: #44403c;">Subject</td><td style="padding: 10px 14px; color: #1c1917;">${record.subject}</td></tr>
            <tr><td style="padding: 10px 14px; font-weight: bold; vertical-align: top; color: #44403c;">Message</td><td style="padding: 10px 14px; color: #1c1917; white-space: pre-wrap;">${record.message}</td></tr>
          </table>
          <p style="margin-top: 24px; font-size: 12px; color: #78716c;">To review and manage all enquiries, visit your <a href="https://manninmaindhan.org/admin/enquiries" style="color: #15803d; font-weight: bold;">Admin Dashboard</a>.</p>
        </div>
      `;
    } else if (type === 'volunteer_application') {
      subject = `[New Volunteer Application] ${record.name} - ${record.preferred_opportunity || 'Grassroots Volunteer'}`;
      detailsHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 12px; background: #fafaf9;">
          <h2 style="color: #14532d; margin-top: 0;">New Volunteer Application</h2>
          <p style="color: #57534e; font-size: 14px;">A new community member has applied to volunteer with Mannin Maindhan Grama Arakkattalai:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e7e5e4;">
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; width: 30%; color: #44403c;">Applicant</td><td style="padding: 10px 14px; color: #1c1917;">${record.name}</td></tr>
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; color: #44403c;">Email</td><td style="padding: 10px 14px; color: #1c1917;"><a href="mailto:${record.email}" style="color: #15803d;">${record.email}</a></td></tr>
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; color: #44403c;">Phone</td><td style="padding: 10px 14px; color: #1c1917;">${record.phone}</td></tr>
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; color: #44403c;">Preferred Role</td><td style="padding: 10px 14px; color: #1c1917;">${record.preferred_opportunity}</td></tr>
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; color: #44403c;">Availability</td><td style="padding: 10px 14px; color: #1c1917;">${record.availability || 'Flexible'}</td></tr>
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; color: #44403c;">Key Skills</td><td style="padding: 10px 14px; color: #1c1917;">${record.skills}</td></tr>
            <tr><td style="padding: 10px 14px; font-weight: bold; vertical-align: top; color: #44403c;">Notes</td><td style="padding: 10px 14px; color: #1c1917; white-space: pre-wrap;">${record.message || 'None provided'}</td></tr>
          </table>
          <p style="margin-top: 24px; font-size: 12px; color: #78716c;">To review and manage all volunteers, visit your <a href="https://manninmaindhan.org/admin/volunteers" style="color: #15803d; font-weight: bold;">Admin Volunteers Dashboard</a>.</p>
        </div>
      `;
    } else if (type === 'job_application') {
      subject = `[New Career Application] ${record.name} - ${record.career_title || 'Position'}`;
      detailsHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 12px; background: #fafaf9;">
          <h2 style="color: #14532d; margin-top: 0;">New Career Application</h2>
          <p style="color: #57534e; font-size: 14px;">A candidate has submitted an application for an open position at Mannin Maindhan Grama Arakkattalai:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e7e5e4;">
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; width: 30%; color: #44403c;">Target Role</td><td style="padding: 10px 14px; color: #1c1917; font-weight: bold;">${record.career_title}</td></tr>
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; color: #44403c;">Candidate</td><td style="padding: 10px 14px; color: #1c1917;">${record.name}</td></tr>
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; color: #44403c;">Email</td><td style="padding: 10px 14px; color: #1c1917;"><a href="mailto:${record.email}" style="color: #15803d;">${record.email}</a></td></tr>
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; color: #44403c;">Phone</td><td style="padding: 10px 14px; color: #1c1917;">${record.phone}</td></tr>
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; color: #44403c;">Experience</td><td style="padding: 10px 14px; color: #1c1917;">${record.experience}</td></tr>
            <tr style="border-bottom: 1px solid #f5f5f4;"><td style="padding: 10px 14px; font-weight: bold; color: #44403c;">Skills</td><td style="padding: 10px 14px; color: #1c1917;">${record.skills}</td></tr>
            <tr><td style="padding: 10px 14px; font-weight: bold; vertical-align: top; color: #44403c;">Cover Note</td><td style="padding: 10px 14px; color: #1c1917; white-space: pre-wrap;">${record.message || 'None provided'}</td></tr>
          </table>
          <p style="margin-top: 24px; font-size: 12px; color: #78716c;">To review and manage all candidate applications, visit your <a href="https://manninmaindhan.org/admin/careers" style="color: #15803d; font-weight: bold;">Admin Careers Dashboard</a>.</p>
        </div>
      `;
    } else {
      return res.status(400).json({ error: `Unsupported submission type: ${type}` });
    }

    // Call Resend API directly using native fetch in Node 18+
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipientEmail],
        subject: subject,
        html: detailsHtml,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return res.status(response.status).json({
        success: false,
        error: data.message || 'Failed to dispatch email notification via Resend.',
      });
    }

    return res.status(200).json({
      success: true,
      messageId: data.id,
      recipient: recipientEmail,
    });
  } catch (err) {
    console.error('Unhandled notification error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while processing notification.',
    });
  }
}

