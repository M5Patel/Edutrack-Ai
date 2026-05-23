import asyncHandler from 'express-async-handler'
import supabase from '../config/supabase.js'
import { formatResponse, startOfDay, endOfDay, startOfWeek } from '../utils/helpers.js'

// @desc    Admin overview
export const getOverview = asyncHandler(async (req, res) => {
  const { count: totalStudents } = await supabase.from('students').select('id', { count: 'exact', head: true })
  const { count: totalFaculty } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'faculty').eq('is_active', true)
  const { count: totalStreams } = await supabase.from('streams').select('id', { count: 'exact', head: true }).eq('is_active', true)

  const todayStart = startOfDay().toISOString()
  const todayEnd = endOfDay().toISOString()
  const { count: submissionsToday } = await supabase.from('submissions').select('id', { count: 'exact', head: true }).gte('submission_date', todayStart).lte('submission_date', todayEnd)

  const { data: todaySubs } = await supabase.from('submissions').select('student_id').gte('submission_date', todayStart).lte('submission_date', todayEnd)
  const submittedIds = [...new Set((todaySubs || []).map(s => s.student_id))]
  const missingToday = (totalStudents || 0) - submittedIds.length

  const { data: scoredSubs } = await supabase.from('submissions').select('ai_score').not('ai_score', 'is', null)
  const avgAiScore = scoredSubs?.length > 0 ? Math.round(scoredSubs.reduce((s, sub) => s + sub.ai_score, 0) / scoredSubs.length) : 0

  res.json(formatResponse({ totalStudents, totalFaculty, totalStreams, submissionsToday, missingToday, avgAiScore }))
})

// @desc    All streams performance
export const getStreamsAnalytics = asyncHandler(async (req, res) => {
  const { data: streams } = await supabase.from('streams').select('*').eq('is_active', true)

  const data = await Promise.all((streams || []).map(async (stream) => {
    const { count: studentCount } = await supabase.from('students').select('id', { count: 'exact', head: true }).eq('stream_id', stream.id)
    const { data: subs } = await supabase.from('submissions').select('ai_score').eq('stream_id', stream.id)
    const avgScore = subs?.length > 0 ? Math.round(subs.reduce((s, sub) => s + (sub.ai_score || 0), 0) / subs.length) : 0
    return { stream: { ...stream, _id: stream.id }, studentCount, submissionCount: subs?.length || 0, avgScore }
  }))

  res.json(formatResponse(data))
})

// @desc    Single stream deep analytics
export const getStreamAnalytics = asyncHandler(async (req, res) => {
  const { data: stream } = await supabase.from('streams').select('*').eq('id', req.params.id).single()
  if (!stream) { res.status(404); throw new Error('Stream not found') }

  const { data: students } = await supabase.from('students').select('*, user:profiles!user_id(name, email, avatar)').eq('stream_id', stream.id)
  const { data: submissions } = await supabase.from('submissions').select('*').eq('stream_id', stream.id).order('submission_date', { ascending: false })

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  }).reverse()

  const dailyCounts = last7Days.map(day => ({
    date: day,
    count: (submissions || []).filter(s => new Date(s.submission_date).toISOString().split('T')[0] === day).length
  }))

  const statusBreakdown = { submitted: 0, reviewed: 0, approved: 0, needs_improvement: 0, late: 0 }
  ;(submissions || []).forEach(s => { if (statusBreakdown[s.status] !== undefined) statusBreakdown[s.status]++ })

  res.json(formatResponse({ stream: { ...stream, _id: stream.id }, students, totalSubmissions: submissions?.length || 0, dailyCounts, statusBreakdown }))
})

// @desc    Student performance data
export const getStudentPerformance = asyncHandler(async (req, res) => {
  const { data: student } = await supabase
    .from('students')
    .select('*, user:profiles!user_id(name, email, avatar), stream:streams!stream_id(name, code, color), badges:student_badges(badge:badges(*))')
    .eq('id', req.params.id)
    .single()
  if (!student) { res.status(404); throw new Error('Student not found') }

  const { data: submissions } = await supabase.from('submissions').select('*').eq('student_id', student.id).order('submission_date', { ascending: false })
  const subs = submissions || []
  const avgScore = subs.length > 0 ? Math.round(subs.reduce((s, sub) => s + (sub.ai_score || 0), 0) / subs.length) : 0

  res.json(formatResponse({
    student: { ...student, _id: student.id, userId: student.user, badges: student.badges?.map(b => b.badge) || [] },
    submissions: subs.map(s => ({ ...s, _id: s.id })),
    avgScore,
    totalSubmissions: subs.length
  }))
})

// @desc    Today's submission rate
export const getDailyAnalytics = asyncHandler(async (req, res) => {
  const todayStart = startOfDay().toISOString()
  const todayEnd = endOfDay().toISOString()
  const { count: totalStudents } = await supabase.from('students').select('id', { count: 'exact', head: true })

  const { data: todaySubs } = await supabase.from('submissions').select('student_id').gte('submission_date', todayStart).lte('submission_date', todayEnd)
  const submitted = [...new Set((todaySubs || []).map(s => s.student_id))].length

  res.json(formatResponse({ totalStudents, submitted, missing: (totalStudents || 0) - submitted, rate: totalStudents > 0 ? Math.round((submitted / totalStudents) * 100) : 0 }))
})

// @desc    Weekly summary
export const getWeeklyAnalytics = asyncHandler(async (req, res) => {
  const weekStart = startOfWeek().toISOString()

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, student:students!student_id(*, user:profiles!user_id(name)), stream:streams!stream_id(name, code)')
    .gte('submission_date', weekStart)

  const byStream = {}
  ;(submissions || []).forEach(s => {
    const name = s.stream?.name || 'Unknown'
    byStream[name] = (byStream[name] || 0) + 1
  })

  res.json(formatResponse({ totalThisWeek: submissions?.length || 0, byStream, submissions: (submissions || []).map(s => ({ ...s, _id: s.id })) }))
})

// @desc    Export analytics
export const exportAnalytics = asyncHandler(async (req, res) => {
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, student:students!student_id(*, user:profiles!user_id(name, email)), stream:streams!stream_id(name, code)')
    .order('submission_date', { ascending: false })

  const exportData = (submissions || []).map(s => ({
    student: s.student?.user?.name || 'N/A',
    email: s.student?.user?.email || 'N/A',
    stream: s.stream?.name || 'N/A',
    title: s.title,
    status: s.status,
    aiScore: s.ai_score || 0,
    date: s.submission_date ? new Date(s.submission_date).toISOString().split('T')[0] : 'N/A'
  }))

  res.json(formatResponse(exportData, 'Export data ready'))
})

// @desc    Generate deterministic report (non-AI replacement)
export const getReport = asyncHandler(async (req, res) => {
  const { type } = req.query

  let dateFrom
  if (type === 'weekly') {
    dateFrom = startOfWeek().toISOString()
  } else if (type === 'daily') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dateFrom = today.toISOString()
  }

  let subQuery = supabase
    .from('submissions')
    .select('*, student:students!student_id(id, user:profiles!user_id(name, email)), stream:streams!stream_id(id, name, code, color)')

  if (dateFrom) subQuery = subQuery.gte('submission_date', dateFrom)

  const { data: submissions, error: subError } = await subQuery
  if (subError) { res.status(400); throw new Error(subError.message) }

  const { data: streams } = await supabase.from('streams').select('*').eq('is_active', true)
  const { count: allStudents } = await supabase.from('students').select('id', { count: 'exact', head: true })

  const subs = submissions || []

  // Per-stream breakdown
  const streamBreakdown = (streams || []).map(s => ({
    name: s.name, code: s.code, color: s.color,
    count: subs.filter(sub => sub.stream_id === s.id).length
  }))

  // Top performers
  const studentScores = {}
  subs.forEach(sub => {
    const key = sub.student_id
    if (!key) return
    if (!studentScores[key]) {
      studentScores[key] = { name: sub.student?.user?.name || 'Unknown', scores: [], count: 0 }
    }
    studentScores[key].scores.push(sub.ai_score || 0)
    studentScores[key].count++
  })

  const topPerformers = Object.values(studentScores)
    .map(s => ({ ...s, avgScore: Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length) }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5)

  const activeSubmitters = Object.keys(studentScores).length
  const streamCountsText = streamBreakdown
    .filter(s => s.count > 0)
    .map(s => `${s.name} (${s.count} submission${s.count > 1 ? 's' : ''})`)
    .join(', ') || 'none'

  const topScorerText = topPerformers[0]
    ? `The top performer during this period was ${topPerformers[0].name} with an average score of ${topPerformers[0].avgScore}/100.`
    : 'No submissions have been graded yet.'

  const executiveSummary = `Executive summary for the ${type} period: A total of ${subs.length} submission${subs.length === 1 ? '' : 's'} were uploaded by ${activeSubmitters} active student${activeSubmitters === 1 ? '' : 's'} across the institute. Submissions per stream are: ${streamCountsText}. ${topScorerText} Student activity remains consistent, with several maintaining their daily learning streaks.`

  res.json(formatResponse({
    type,
    period: type === 'weekly' ? 'This Week' : 'Today',
    totalSubmissions: subs.length,
    totalStudents: allStudents,
    activeSubmitters,
    streamBreakdown,
    topPerformers,
    executiveSummary
  }, 'Report generated successfully'))
})
