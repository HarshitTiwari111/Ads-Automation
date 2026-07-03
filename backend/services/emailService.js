const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL] Skipped (SMTP not configured): ${subject} -> ${to}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Ads Automation" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Sent: ${subject} -> ${to}`);
  } catch (error) {
    console.error(`[EMAIL] Failed: ${error.message}`);
  }
};

const statusLabels = {
  pending: { label: 'Pending', color: '#e65100' },
  created: { label: 'Created', color: '#1565c0' },
  warmup: { label: 'Warm-up', color: '#f9a825' },
  active: { label: 'Active', color: '#2e7d32' },
  paused: { label: 'Paused', color: '#7b1fa2' },
  failed: { label: 'Failed', color: '#c62828' },
};

exports.sendStatusChangeEmail = async (userEmail, account, oldStatus, newStatus) => {
  const s = statusLabels[newStatus] || { label: newStatus, color: '#333' };
  const subject = `Account "${account.accountName}" status changed to ${s.label}`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
      <h2 style="margin:0 0 16px;color:#1a1a2e;">Account Status Update</h2>
      <p style="margin:0 0 20px;color:#374151;">The status of your Google Ads account has been updated.</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:10px 0;color:#6b7280;font-size:13px;">Account</td><td style="padding:10px 0;font-weight:600;">${account.accountName}</td></tr>
        <tr><td style="padding:10px 0;color:#6b7280;font-size:13px;">Client</td><td style="padding:10px 0;">${account.clientName}</td></tr>
        <tr><td style="padding:10px 0;color:#6b7280;font-size:13px;">Previous Status</td><td style="padding:10px 0;">${oldStatus}</td></tr>
        <tr><td style="padding:10px 0;color:#6b7280;font-size:13px;">New Status</td><td style="padding:10px 0;"><span style="background:${s.color}22;color:${s.color};padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">${s.label}</span></td></tr>
      </table>
      <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">Ads Automation Dashboard</p>
    </div>
  `;
  await sendEmail(userEmail, subject, html);
};

exports.sendEmail = sendEmail;
