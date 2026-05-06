const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const wrapEmail = ({ preheader, eyebrow, title, subtitle, bodyHtml, actionLabel, actionUrl, footerText }) => `
<div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 18px 50px rgba(15, 23, 42, 0.08);">
          <tr>
            <td style="padding:28px 32px 12px 32px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);color:#ffffff;">
              <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.85;">${escapeHtml(eyebrow)}</div>
              <h1 style="margin:10px 0 8px 0;font-size:28px;line-height:1.2;font-family:Georgia,'Times New Roman',serif;">${escapeHtml(title)}</h1>
              <p style="margin:0 0 10px 0;font-size:15px;line-height:1.6;opacity:0.95;">${escapeHtml(subtitle)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
              ${actionUrl && actionLabel ? `
                <div style="margin:28px 0 6px 0;">
                  <a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700;">${escapeHtml(actionLabel)}</a>
                </div>
              ` : ''}
              <div style="margin-top:30px;padding-top:18px;border-top:1px solid #e5e7eb;color:#64748b;font-size:13px;line-height:1.6;">
                ${escapeHtml(footerText)}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>`;

const buildContactEmail = ({ name, email, subject, message }) => {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    return {
        subject: `Insight Ink contact: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
        html: wrapEmail({
            preheader: `New message from ${name}`,
            eyebrow: 'Contact inbox',
            title: 'New message received',
            subtitle: `A visitor sent a new contact message through Insight Ink.`,
            bodyHtml: `
              <div style="display:grid;gap:14px;">
                <div><strong style="display:block;color:#334155;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Name</strong><div style="font-size:16px;">${safeName}</div></div>
                <div><strong style="display:block;color:#334155;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Email</strong><div style="font-size:16px;">${safeEmail}</div></div>
                <div><strong style="display:block;color:#334155;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Subject</strong><div style="font-size:16px;">${safeSubject}</div></div>
                <div>
                  <strong style="display:block;color:#334155;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Message</strong>
                  <div style="padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;line-height:1.7;white-space:normal;">${safeMessage}</div>
                </div>
              </div>
            `,
            footerText: 'This message was sent from the Insight Ink contact form.',
        }),
    };
};

const buildAdminNoticeEmail = ({ recipientName, senderName, subject, message, portalUrl }) => {
    const safeRecipientName = escapeHtml(recipientName);
    const safeSenderName = escapeHtml(senderName);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    return {
        subject: `Insight Ink notice: ${subject}`,
        text: `Hello ${recipientName},\n\n${senderName} sent you a notice from Insight Ink.\n\nSubject: ${subject}\n\n${message}\n\nOpen your dashboard: ${portalUrl}`,
        html: wrapEmail({
            preheader: `A new notice from ${senderName}`,
            eyebrow: 'Account notice',
            title: 'You have a new notice',
            subtitle: `${senderName} sent an account notification from the superadmin portal.`,
            bodyHtml: `
              <p style="margin:0 0 18px 0;font-size:16px;line-height:1.7;">Hello ${safeRecipientName},</p>
              <p style="margin:0 0 18px 0;font-size:16px;line-height:1.7;">${safeSenderName} sent the following notice:</p>
              <div style="margin-bottom:16px;">
                <strong style="display:block;color:#334155;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Subject</strong>
                <div style="font-size:18px;font-weight:700;color:#0f172a;">${safeSubject}</div>
              </div>
              <div>
                <strong style="display:block;color:#334155;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Message</strong>
                <div style="padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;line-height:1.7;">${safeMessage}</div>
              </div>
            `,
            actionLabel: 'Open your profile',
            actionUrl: portalUrl,
            footerText: 'If you have questions about this notice, reply to the sender or visit your account dashboard.',
        }),
    };
};

module.exports = {
    buildContactEmail,
    buildAdminNoticeEmail,
};