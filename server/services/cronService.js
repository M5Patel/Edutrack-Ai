import cron from 'node-cron'
import supabase from '../config/supabase.js'
import { createNotification } from './notificationService.js'
import { sendEmail } from './emailService.js'

export const startCronJobs = (io) => {
  // Check missing submissions daily at 11:45 PM
  cron.schedule('45 23 * * *', async () => {
    console.log('⏰ Running daily missing check...')
    try {
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()

      const { data: allStudents } = await supabase
        .from('students')
        .select('id, user_id, user:profiles!user_id(name, email)')

      const { data: todaySubs } = await supabase
        .from('submissions')
        .select('student_id')
        .gte('submission_date', todayStart)
        .lte('submission_date', todayEnd)

      const submittedIds = [...new Set((todaySubs || []).map(s => s.student_id))]
      const missing = (allStudents || []).filter(s => !submittedIds.includes(s.id))

      for (const student of missing) {
        // Reset streak
        await supabase.from('students').update({ current_streak: 0 }).eq('id', student.id)

        // Send notification
        await createNotification({
          recipient_id: student.user_id,
          type: 'missing',
          title: 'Submission Missing',
          message: 'You didn\'t submit your daily work today. Your streak has been reset.',
          icon: '⚠️'
        }, io)

        // Send email
        try {
          await sendEmail(
            student.user?.email,
            'EduTrack AI: Missing Submission',
            `<p>Hi ${student.user?.name},</p><p>You didn't submit your daily work today. Your streak has been reset.</p>`
          )
        } catch (e) { /* email optional */ }
      }

      console.log(`✅ Missing check complete: ${missing.length} students missed`)
    } catch (error) {
      console.error('Cron error:', error.message)
    }
  })

  console.log('⏰ Cron jobs scheduled')
}
