import asyncHandler from 'express-async-handler'
import supabase from '../config/supabase.js'
import { getPagination, createAuditLog, formatResponse } from '../utils/helpers.js'

// @desc    Get all students (paginated)
// @route   GET /api/students
export const getStudents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)
  const { stream, batch, search } = req.query

  let query = supabase
    .from('students')
    .select('*, user:profiles!user_id(id, name, email, avatar, is_active), stream:streams!stream_id(id, name, code, color), badges:student_badges(badge:badges(*)), submissions(id)', { count: 'exact' })

  if (stream) query = query.eq('stream_id', stream)
  if (batch) query = query.eq('batch', batch)
  if (search) query = query.ilike('user.name', `%${search}%`)

  const { data, count, error } = await query.order('created_at', { ascending: false }).range(skip, skip + limit - 1)
  if (error) { res.status(400); throw new Error(error.message) }

  const students = (data || []).map(s => {
    const totalSubmissions = s.submissions ? s.submissions.length : 0;
    delete s.submissions;
    return {
      ...s,
      _id: s.id,
      userId: s.user,
      badges: s.badges?.map(b => b.badge) || [],
      totalSubmissions
    }
  })

  res.json(formatResponse(students, 'Students fetched', { total: count, page, pages: Math.ceil((count || 0) / limit) }))
})

// @desc    Create student
// @route   POST /api/students
export const createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, rollNumber, stream, batch, phone } = req.body

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { name, role: 'student' }
  })
  if (authError) { res.status(400); throw new Error(authError.message) }

  await supabase.from('profiles').update({ name, role: 'student' }).eq('id', authData.user.id)

  const { data: student, error } = await supabase.from('students').insert({
    user_id: authData.user.id, roll_number: rollNumber, stream_id: stream || null, batch, phone
  }).select().single()
  if (error) { res.status(400); throw new Error(error.message) }

  await createAuditLog({ userId: req.user.id, action: 'STUDENT_CREATED', entity: 'Student', entityId: student.id, details: { name, rollNumber }, ipAddress: req.ip })

  res.status(201).json(formatResponse({ ...student, _id: student.id }, 'Student created'))
})

// @desc    Get student by ID
// @route   GET /api/students/:id
export const getStudentById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, user:profiles!user_id(id, name, email, avatar, is_active, last_login), stream:streams!stream_id(*), badges:student_badges(badge:badges(*))')
    .eq('id', req.params.id)
    .single()

  if (error || !data) { res.status(404); throw new Error('Student not found') }

  res.json(formatResponse({ ...data, _id: data.id, userId: data.user, badges: data.badges?.map(b => b.badge) || [] }))
})

// @desc    Update student
// @route   PUT /api/students/:id
export const updateStudent = asyncHandler(async (req, res) => {
  const { data: student } = await supabase.from('students').select('*, user:profiles!user_id(*)').eq('id', req.params.id).single()
  if (!student) { res.status(404); throw new Error('Student not found') }

  const { name, email, batch, phone, stream } = req.body
  if (name || email) {
    const profileUpdate = {}
    if (name) profileUpdate.name = name
    if (email) profileUpdate.email = email
    await supabase.from('profiles').update(profileUpdate).eq('id', student.user_id)
  }

  const studentUpdate = {}
  if (batch) studentUpdate.batch = batch
  if (phone) studentUpdate.phone = phone
  if (stream) studentUpdate.stream_id = stream
  if (Object.keys(studentUpdate).length > 0) {
    await supabase.from('students').update(studentUpdate).eq('id', req.params.id)
  }

  await createAuditLog({ userId: req.user.id, action: 'STUDENT_UPDATED', entity: 'Student', entityId: req.params.id, ipAddress: req.ip })

  const { data: updated } = await supabase.from('students').select('*').eq('id', req.params.id).single()
  res.json(formatResponse({ ...updated, _id: updated.id }, 'Student updated'))
})

// @desc    Delete student (soft delete)
// @route   DELETE /api/students/:id
export const deleteStudent = asyncHandler(async (req, res) => {
  const { data: student } = await supabase.from('students').select('user_id').eq('id', req.params.id).single()
  if (!student) { res.status(404); throw new Error('Student not found') }

  await supabase.from('profiles').update({ is_active: false }).eq('id', student.user_id)

  await createAuditLog({ userId: req.user.id, action: 'STUDENT_DELETED', entity: 'Student', entityId: req.params.id, ipAddress: req.ip })

  res.json(formatResponse(null, 'Student deactivated'))
})

// @desc    Get student submissions
// @route   GET /api/students/:id/submissions
export const getStudentSubmissions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)

  const { data, count, error } = await supabase
    .from('submissions')
    .select('*, stream:streams!stream_id(name, code, color)', { count: 'exact' })
    .eq('student_id', req.params.id)
    .order('submission_date', { ascending: false })
    .range(skip, skip + limit - 1)

  if (error) { res.status(400); throw new Error(error.message) }

  res.json(formatResponse(data?.map(s => ({ ...s, _id: s.id })) || [], 'Submissions fetched', { total: count, page, pages: Math.ceil((count || 0) / limit) }))
})

// @desc    Get student analytics
// @route   GET /api/students/:id/analytics
export const getStudentAnalytics = asyncHandler(async (req, res) => {
  const { data: student } = await supabase
    .from('students')
    .select('*, user:profiles!user_id(name), badges:student_badges(badge:badges(*))')
    .eq('id', req.params.id)
    .single()
  if (!student) { res.status(404); throw new Error('Student not found') }

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('student_id', req.params.id)
    .order('submission_date', { ascending: false })

  const subs = submissions || []
  const totalSubmissions = subs.length
  const avgAiScore = totalSubmissions > 0 ? Math.round(subs.reduce((sum, s) => sum + (s.ai_score || 0), 0) / totalSubmissions) : 0
  const approvedCount = subs.filter(s => s.status === 'approved').length
  const needsImprovementCount = subs.filter(s => s.status === 'needs_improvement').length

  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)
  const dailyData = subs
    .filter(s => new Date(s.submission_date) >= last30Days)
    .reduce((acc, s) => {
      const day = new Date(s.submission_date).toISOString().split('T')[0]
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {})

  const scoreTrend = subs.slice(0, 10).map(s => ({
    date: s.submission_date,
    score: s.ai_score || 0,
    title: s.title
  })).reverse()

  res.json(formatResponse({
    student: { ...student, _id: student.id, badges: student.badges?.map(b => b.badge) || [] },
    stats: { totalSubmissions, avgAiScore, approvedCount, needsImprovementCount, currentStreak: student.current_streak, longestStreak: student.longest_streak },
    dailyData,
    scoreTrend
  }))
})

// @desc    Get leaderboard
// @route   GET /api/students/leaderboard
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { stream, period } = req.query

  let studentQuery = supabase.from('students').select('*, user:profiles!user_id(name, email, avatar), stream:streams!stream_id(name, code, color), badges:student_badges(badge_id)')
  if (stream) studentQuery = studentQuery.eq('stream_id', stream)

  const { data: students } = await studentQuery

  let dateFilter = null
  if (period === 'week') { dateFilter = new Date(); dateFilter.setDate(dateFilter.getDate() - 7) }
  else if (period === 'month') { dateFilter = new Date(); dateFilter.setMonth(dateFilter.getMonth() - 1) }

  const leaderboard = await Promise.all((students || []).map(async (student) => {
    let subQuery = supabase.from('submissions').select('ai_score').eq('student_id', student.id)
    if (dateFilter) subQuery = subQuery.gte('submission_date', dateFilter.toISOString())
    const { data: subs } = await subQuery

    const totalSubs = subs?.length || 0
    const avgScore = totalSubs > 0 ? subs.reduce((sum, s) => sum + (s.ai_score || 0), 0) / totalSubs : 0
    const daysInPeriod = period === 'week' ? 7 : period === 'month' ? 30 : 90
    const submissionRate = Math.min((totalSubs / daysInPeriod) * 100, 100)
    const compositeScore = (avgScore * 0.4) + (submissionRate * 0.4) + (student.current_streak * 0.2 * 10)

    return {
      student: { ...student, _id: student.id, userId: student.user },
      totalSubmissions: totalSubs,
      avgScore: Math.round(avgScore),
      submissionRate: Math.round(submissionRate),
      streak: student.current_streak,
      badgeCount: student.badges?.length || 0,
      compositeScore: Math.round(compositeScore)
    }
  }))

  leaderboard.sort((a, b) => b.compositeScore - a.compositeScore)
  leaderboard.forEach((entry, i) => entry.rank = i + 1)

  res.json(formatResponse(leaderboard.slice(0, 50)))
})
