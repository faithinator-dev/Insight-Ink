const transporter = require('../config/mailer');
const { buildContactEmail } = require('../utils/emailTemplates');

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

    const emailContent = buildContactEmail({ name, email, subject, message });

    const info = await transporter.sendMail({
      from: `Insight Ink <${fromAddress}>`,
      to: toAddress,
      replyTo: email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
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