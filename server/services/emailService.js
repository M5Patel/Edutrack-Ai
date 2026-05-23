import nodemailer from 'nodemailer'

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"EduTrack AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    })
    console.log(`📧 Email sent to ${to}`)
  } catch (error) {
    console.error('Email error:', error.message)
  }
}

const emailTemplate = (title, body) => `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: 'Inter', sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .header { text-align: center; margin-bottom: 30px; }
  .header h1 { color: #6366F1; font-size: 28px; margin: 0; }
  .header p { color: #94A3B8; font-size: 14px; }
  .card { background: #1E293B; border-radius: 12px; padding: 30px; margin-bottom: 20px; border: 1px solid #334155; }
  .card h2 { color: #F8FAFC; font-size: 20px; margin-top: 0; }
  .card p { color: #CBD5E1; line-height: 1.6; }
  .btn { display: inline-block; background: #6366F1; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  .footer { text-align: center; color: #64748B; font-size: 12px; margin-top: 30px; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 EduTrack AI</h1>
      <p>Smart Daily Work Submission & Tracking</p>
    </div>
    <div class="card">
      <h2>${title}</h2>
      ${body}
    </div>
    <div class="footer">
      <p>This is an automated email from EduTrack AI. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`

export const sendWelcomeEmail = async (email, name) => {
  const html = emailTemplate('Welcome to EduTrack AI! 🎉', `
    <p>Hi ${name},</p>
    <p>Your account has been created successfully. Start submitting your daily work to build your streak!</p>
    <a href="${process.env.CLIENT_URL}/login" class="btn">Get Started</a>
  `)
  await sendEmail(email, 'Welcome to EduTrack AI!', html)
}

export const sendMissingSubmissionEmail = async (email, name) => {
  const html = emailTemplate('Missing Submission Alert ⚠️', `
    <p>Hi ${name},</p>
    <p>You haven't submitted your daily work today. Don't break your streak!</p>
    <a href="${process.env.CLIENT_URL}/submit" class="btn">Submit Now</a>
  `)
  await sendEmail(email, 'Missing Submission - EduTrack AI', html)
}

export const sendFeedbackEmail = async (email, name, submissionTitle) => {
  const html = emailTemplate('New Feedback Received 📝', `
    <p>Hi ${name},</p>
    <p>You've received feedback on your submission: <strong>"${submissionTitle}"</strong></p>
    <a href="${process.env.CLIENT_URL}/submissions" class="btn">View Feedback</a>
  `)
  await sendEmail(email, 'New Feedback - EduTrack AI', html)
}

export const sendBadgeEmail = async (email, name, badgeName, badgeIcon) => {
  const html = emailTemplate(`Badge Earned: ${badgeIcon} ${badgeName}`, `
    <p>Congratulations ${name}! 🎉</p>
    <p>You've earned the <strong>${badgeIcon} ${badgeName}</strong> badge. Keep up the great work!</p>
    <a href="${process.env.CLIENT_URL}/progress" class="btn">View Your Badges</a>
  `)
  await sendEmail(email, `Badge Earned: ${badgeName} - EduTrack AI`, html)
}
