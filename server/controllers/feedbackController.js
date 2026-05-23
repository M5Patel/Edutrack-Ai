import asyncHandler from 'express-async-handler'
import supabase from '../config/supabase.js'
import { createAuditLog, formatResponse } from '../utils/helpers.js'
import { createNotification } from '../services/notificationService.js'

// @desc    Add feedback
// @route   POST /api/feedback/:submissionId
export const addFeedback = asyncHandler(async (req, res) => {
  const { remarks, rating, aiFeedbackSuggestion, usedAISuggestion, privateNote } = req.body

  const { data: submission } = await supabase
    .from('submissions')
    .select('*, student:students!student_id(id, user_id)')
    .eq('id', req.params.submissionId)
    .single()
  if (!submission) { res.status(404); throw new Error('Submission not found') }

  const { data: feedback, error } = await supabase.from('feedback').insert({
    submission_id: submission.id,
    faculty_id: req.user.id,
    remarks,
    rating,
    ai_feedback_suggestion: aiFeedbackSuggestion,
    used_ai_suggestion: usedAISuggestion || false,
    private_note: privateNote
  }).select().single()
  if (error) { res.status(400); throw new Error(error.message) }

  // Update submission status and grade score (rating * 20)
  await supabase.from('submissions').update({ status: 'reviewed', ai_score: rating * 20 }).eq('id', submission.id)

  // Increment faculty reviewed count
  await supabase.rpc('increment_reviewed', { faculty_user_id: req.user.id }).catch(() => {
    // Fallback: manual increment
    supabase.from('faculty').select('total_reviewed').eq('user_id', req.user.id).single().then(({ data: f }) => {
      if (f) supabase.from('faculty').update({ total_reviewed: (f.total_reviewed || 0) + 1 }).eq('user_id', req.user.id)
    })
  })

  const io = req.app.get('io')
  const studentUserId = submission.student?.user_id

  await createNotification({
    recipient_id: studentUserId,
    type: 'feedback',
    title: 'New Feedback Received',
    message: `Faculty reviewed your submission "${submission.title}"`,
    link: `/submissions/${submission.id}`,
    icon: '📝'
  }, io)

  if (io) io.to(`user_${studentUserId}`).emit('feedback_added', { feedback, submission })

  await createAuditLog({ userId: req.user.id, action: 'FEEDBACK_ADDED', entity: 'Feedback', entityId: feedback.id, details: { submissionId: submission.id, rating }, ipAddress: req.ip })

  res.status(201).json(formatResponse({ ...feedback, _id: feedback.id }, 'Feedback added'))
})

// @desc    Get feedback for submission
export const getFeedback = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('feedback')
    .select('*, faculty:profiles!faculty_id(name, email, avatar)')
    .eq('submission_id', req.params.submissionId)
    .order('created_at', { ascending: false })

  if (error) { res.status(400); throw new Error(error.message) }
  res.json(formatResponse((data || []).map(f => ({ ...f, _id: f.id }))))
})

// @desc    Update feedback
export const updateFeedback = asyncHandler(async (req, res) => {
  const { data: feedback } = await supabase.from('feedback').select('*').eq('id', req.params.id).single()
  if (!feedback) { res.status(404); throw new Error('Feedback not found') }
  if (feedback.faculty_id !== req.user.id) { res.status(403); throw new Error('Not authorized to edit this feedback') }

  const updates = {}
  const { remarks, rating, privateNote } = req.body
  if (remarks) updates.remarks = remarks
  if (rating) updates.rating = rating
  if (privateNote !== undefined) updates.private_note = privateNote

  await supabase.from('feedback').update(updates).eq('id', req.params.id)

  await createAuditLog({ userId: req.user.id, action: 'FEEDBACK_UPDATED', entity: 'Feedback', entityId: req.params.id, ipAddress: req.ip })

  const { data: updated } = await supabase.from('feedback').select('*').eq('id', req.params.id).single()
  res.json(formatResponse({ ...updated, _id: updated.id }, 'Feedback updated'))
})

// @desc    Delete feedback
export const deleteFeedback = asyncHandler(async (req, res) => {
  const { data: feedback } = await supabase.from('feedback').select('id').eq('id', req.params.id).single()
  if (!feedback) { res.status(404); throw new Error('Feedback not found') }

  await supabase.from('feedback').delete().eq('id', req.params.id)

  await createAuditLog({ userId: req.user.id, action: 'FEEDBACK_DELETED', entity: 'Feedback', entityId: req.params.id, ipAddress: req.ip })

  res.json(formatResponse(null, 'Feedback deleted'))
})
