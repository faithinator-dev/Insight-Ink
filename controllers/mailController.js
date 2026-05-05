const transporter = require('../config/mailer');

exports.sendMail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: 'Name, email, subject, and message are required.',
      });
    }

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
    const toAddress = process.env.MAIL_TO || process.env.SMTP_USER;

    if (!fromAddress || !toAddress) {
      return res.status(500).json({
        message: 'Mail settings are not configured. Set SMTP_FROM and MAIL_TO or SMTP_USER.',
      });
    }

    const info = await transporter.sendMail({
      from: `Insight Ink <${fromAddress}>`,
      to: toAddress,
      replyTo: email,
      subject: `New message: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin-bottom: 12px;">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; white-space: pre-wrap;">${message}</div>
        </div>
      `,
    });

    res.status(200).json({
      message: 'Email sent successfully.',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to send email.',
    });
  }
};