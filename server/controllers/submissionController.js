import asyncHandler from 'express-async-handler'
import supabase from '../config/supabase.js'
import cloudinary from '../config/cloudinary.js'
import { getPagination, createAuditLog, formatResponse, startOfDay, endOfDay } from '../utils/helpers.js'
import { createNotification } from '../services/notificationService.js'

// Helper: update streak
const updateStreak = async (studentId) => {
  const { data: student } = await supabase.from('students').select('*').eq('id', studentId).single()
  if (!student) return

  const today = startOfDay()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let newStreak = student.current_streak
  if (student.last_submission_date) {
    const lastSub = startOfDay(new Date(student.last_submission_date))
    if (lastSub.getTime() === yesterday.getTime()) {
      newStreak += 1
    } else if (lastSub.getTime() < yesterday.getTime()) {
      newStreak = 1
    }
  } else {
    newStreak = 1
  }

  await supabase.from('students').update({
    current_streak: newStreak,
    longest_streak: Math.max(newStreak, student.longest_streak),
    last_submission_date: new Date().toISOString(),
    total_submissions: student.total_submissions + 1
  }).eq('id', studentId)
}

// Helper: check and award badges
const checkBadges = async (studentId, submission, io) => {
  const { data: student } = await supabase.from('students').select('*, existing_badges:student_badges(badge_id)').eq('id', studentId).single()
  const { data: badges } = await supabase.from('badges').select('*')
  if (!student || !badges) return

  const existingBadgeIds = student.existing_badges?.map(b => b.badge_id) || []
  const earned = []

  for (const badge of badges) {
    if (existingBadgeIds.includes(badge.id)) continue

    let qualify = false
    if (badge.name === 'First Step' && student.total_submissions >= 1) qualify = true
    if (badge.name === 'On Fire' && student.current_streak >= 7) qualify = true
    if (badge.name === 'Consistent' && student.current_streak >= 30) qualify = true
    if (badge.name === 'Top Scorer' && submission.ai_score >= 90) qualify = true
    if (badge.name === 'Perfect Week' || badge.name === 'Overachiever') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { count } = await supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('student_id', studentId).gte('submission_date', weekAgo.toISOString())
      if (badge.name === 'Perfect Week' && count >= 7) qualify = true
      if (badge.name === 'Overachiever' && count >= 10) qualify = true
    }

    if (qualify) {
      await supabase.from('student_badges').insert({ student_id: studentId, badge_id: badge.id })
      earned.push(badge)
      await createNotification({
        recipient_id: student.user_id,
        type: 'badge',
        title: `Badge Earned: ${badge.name}`,
        message: `You earned the ${badge.icon} ${badge.name} badge!`,
        icon: badge.icon
      }, io)
    }
  }
  return earned
}

// @desc    Get all submissions
// @route   GET /api/submissions
export const getSubmissions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)
  const { student, stream, status, date } = req.query

  let query = supabase
    .from('submissions')
    .select('*, student:students!student_id(*, user:profiles!user_id(name, email, avatar)), stream:streams!stream_id(name, code, color)', { count: 'exact' })

  if (student) query = query.eq('student_id', student)
  if (stream) query = query.eq('stream_id', stream)
  if (status) query = query.eq('status', status)
  if (date) {
    query = query.gte('submission_date', startOfDay(new Date(date)).toISOString()).lte('submission_date', endOfDay(new Date(date)).toISOString())
  }

  const { data, count, error } = await query.order('submission_date', { ascending: false }).range(skip, skip + limit - 1)
  if (error) { res.status(400); throw new Error(error.message) }

  const mapped = (data || []).map(s => ({ ...s, _id: s.id }))
  res.json(formatResponse(mapped, 'Submissions fetched', { total: count, page, pages: Math.ceil((count || 0) / limit) }))
})

// @desc    Create submission
// @route   POST /api/submissions
export const createSubmission = asyncHandler(async (req, res) => {
  const { title, description } = req.body

  const { data: student } = await supabase.from('students').select('*').eq('user_id', req.user.id).single()
  if (!student) { res.status(404); throw new Error('Student profile not found') }

  // Upload files to Cloudinary
  const files = []
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const b64 = Buffer.from(file.buffer).toString('base64')
      const dataURI = `data:${file.mimetype};base64,${b64}`
      try {
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: `edutrack/${student.roll_number}`,
          resource_type: 'auto'
        })
        files.push({ url: result.secure_url, publicId: result.public_id, fileType: file.mimetype, fileName: file.originalname, fileSize: file.size })
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr.message)
      }
    }
  }

  const { data: submission, error } = await supabase.from('submissions').insert({
    student_id: student.id,
    stream_id: student.stream_id,
    title,
    description,
    files
  }).select().single()
  if (error) { res.status(400); throw new Error(error.message) }

  await updateStreak(student.id)

  const io = req.app.get('io')
  await checkBadges(student.id, submission, io)

  if (io) {
    io.to(`stream_${student.stream_id}`).emit('new_submission', { submission, studentName: req.user.name })
  }

  await createAuditLog({ userId: req.user.id, action: 'SUBMISSION_CREATED', entity: 'Submission', entityId: submission.id, details: { title }, ipAddress: req.ip })



  res.status(201).json(formatResponse({ ...submission, _id: submission.id }, 'Submission created successfully'))
})

// @desc    Get single submission
// @route   GET /api/submissions/:id
export const getSubmissionById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, student:students!student_id(*, user:profiles!user_id(name, email, avatar)), stream:streams!stream_id(name, code, color)')
    .eq('id', req.params.id)
    .single()

  if (error || !data) { res.status(404); throw new Error('Submission not found') }
  res.json(formatResponse({ ...data, _id: data.id }))
})

// @desc    Update / resubmit
// @route   PUT /api/submissions/:id
export const updateSubmission = asyncHandler(async (req, res) => {
  const { data: submission } = await supabase.from('submissions').select('*').eq('id', req.params.id).single()
  if (!submission) { res.status(404); throw new Error('Submission not found') }

  const prevVersions = [...(submission.previous_versions || []), { files: submission.files, submittedAt: new Date().toISOString() }]

  const updates = { version: submission.version + 1, previous_versions: prevVersions, status: 'submitted', ai_analyzed: false }

  const { title, description } = req.body
  if (title) updates.title = title
  if (description) updates.description = description

  if (req.files && req.files.length > 0) {
    const { data: student } = await supabase.from('students').select('roll_number').eq('id', submission.student_id).single()
    const files = []
    for (const file of req.files) {
      const b64 = Buffer.from(file.buffer).toString('base64')
      const dataURI = `data:${file.mimetype};base64,${b64}`
      try {
        const result = await cloudinary.uploader.upload(dataURI, { folder: `edutrack/${student?.roll_number || 'uploads'}`, resource_type: 'auto' })
        files.push({ url: result.secure_url, publicId: result.public_id, fileType: file.mimetype, fileName: file.originalname, fileSize: file.size })
      } catch (e) { console.error('Upload error:', e.message) }
    }
    updates.files = files
  }

  await supabase.from('submissions').update(updates).eq('id', req.params.id)

  await createAuditLog({ userId: req.user.id, action: 'SUBMISSION_UPDATED', entity: 'Submission', entityId: req.params.id, ipAddress: req.ip })

  const { data: updated } = await supabase.from('submissions').select('*').eq('id', req.params.id).single()
  res.json(formatResponse({ ...updated, _id: updated.id }, 'Submission updated'))
})

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
export const deleteSubmission = asyncHandler(async (req, res) => {
  const { error } = await supabase.from('submissions').delete().eq('id', req.params.id)
  if (error) { res.status(400); throw new Error(error.message) }

  await createAuditLog({ userId: req.user.id, action: 'SUBMISSION_DELETED', entity: 'Submission', entityId: req.params.id, ipAddress: req.ip })

  res.json(formatResponse(null, 'Submission deleted'))
})

// @desc    Update submission status
// @route   PUT /api/submissions/:id/status
export const updateSubmissionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body

  const { data: submission } = await supabase.from('submissions').select('*, student:students!student_id(id, user_id)').eq('id', req.params.id).single()
  if (!submission) { res.status(404); throw new Error('Submission not found') }

  await supabase.from('submissions').update({ status }).eq('id', req.params.id)

  const io = req.app.get('io')
  const studentUserId = submission.student?.user_id

  if (status === 'approved') {
    await createNotification({ recipient_id: studentUserId, type: 'approved', title: 'Submission Approved!', message: `Your submission "${submission.title}" has been approved.`, link: `/submissions/${submission.id}`, icon: '✅' }, io)
    if (io) io.to(`user_${studentUserId}`).emit('submission_approved', { submission })
  } else if (status === 'needs_improvement') {
    await createNotification({ recipient_id: studentUserId, type: 'needs_improvement', title: 'Needs Improvement', message: `Your submission "${submission.title}" needs improvement.`, link: `/submissions/${submission.id}`, icon: '⚠️' }, io)
    if (io) io.to(`user_${studentUserId}`).emit('needs_improvement', { submission })
  }

  await createAuditLog({ userId: req.user.id, action: 'STATUS_UPDATED', entity: 'Submission', entityId: req.params.id, details: { status }, ipAddress: req.ip })

  res.json(formatResponse({ ...submission, status, _id: submission.id }, 'Status updated'))
})

// @desc    Get today's submissions
// @route   GET /api/submissions/today
export const getTodaySubmissions = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, student:students!student_id(*, user:profiles!user_id(name, email, avatar)), stream:streams!stream_id(name, code, color)')
    .gte('submission_date', startOfDay().toISOString())
    .lte('submission_date', endOfDay().toISOString())
    .order('submission_date', { ascending: false })

  if (error) { res.status(400); throw new Error(error.message) }
  res.json(formatResponse((data || []).map(s => ({ ...s, _id: s.id })), `${data?.length || 0} submissions today`))
})

// @desc    Get missing students
// @route   GET /api/submissions/missing
export const getMissingSubmissions = asyncHandler(async (req, res) => {
  const { data: allStudents } = await supabase
    .from('students')
    .select('*, user:profiles!user_id(name, email, avatar), stream:streams!stream_id(name, code, color)')

  const { data: todaySubs } = await supabase
    .from('submissions')
    .select('student_id')
    .gte('submission_date', startOfDay().toISOString())
    .lte('submission_date', endOfDay().toISOString())

  const submittedIds = [...new Set((todaySubs || []).map(s => s.student_id))]
  const missing = (allStudents || []).filter(s => !submittedIds.includes(s.id)).map(s => ({ ...s, _id: s.id, userId: s.user }))

  res.json(formatResponse(missing, `${missing.length} students have not submitted today`))
})
