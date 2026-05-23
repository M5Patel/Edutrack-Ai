import asyncHandler from 'express-async-handler'
import supabase from '../config/supabase.js'
import { createAuditLog, formatResponse } from '../utils/helpers.js'

// @desc    Get all streams
export const getStreams = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('streams')
    .select('*, faculty_list:stream_faculty(faculty:faculty(*, user:profiles!user_id(name, email, avatar)))')

  if (error) { res.status(400); throw new Error(error.message) }

  const mapped = (data || []).map(s => ({
    ...s, _id: s.id,
    faculty: s.faculty_list?.map(sf => sf.faculty?.user) || []
  }))
  res.json(formatResponse(mapped))
})

// @desc    Create stream
export const createStream = asyncHandler(async (req, res) => {
  const { name, code, description, color, icon } = req.body

  const { data: stream, error } = await supabase.from('streams').insert({ name, code, description, color, icon }).select().single()
  if (error) { res.status(400); throw new Error(error.message) }

  await createAuditLog({ userId: req.user.id, action: 'STREAM_CREATED', entity: 'Stream', entityId: stream.id, details: { name, code }, ipAddress: req.ip })

  res.status(201).json(formatResponse({ ...stream, _id: stream.id }, 'Stream created'))
})

// @desc    Get stream by ID with stats
export const getStreamById = asyncHandler(async (req, res) => {
  const { data: stream, error } = await supabase
    .from('streams')
    .select('*, faculty_list:stream_faculty(faculty:faculty(*, user:profiles!user_id(name, email, avatar)))')
    .eq('id', req.params.id)
    .single()

  if (error || !stream) { res.status(404); throw new Error('Stream not found') }

  const { count: studentCount } = await supabase.from('students').select('id', { count: 'exact', head: true }).eq('stream_id', stream.id)
  const { count: submissionCount } = await supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('stream_id', stream.id)

  res.json(formatResponse({
    stream: { ...stream, _id: stream.id, faculty: stream.faculty_list?.map(sf => sf.faculty?.user) || [] },
    stats: { studentCount, submissionCount }
  }))
})

// @desc    Update stream
export const updateStream = asyncHandler(async (req, res) => {
  const { data: stream } = await supabase.from('streams').select('id').eq('id', req.params.id).single()
  if (!stream) { res.status(404); throw new Error('Stream not found') }

  const updates = {}
  const { description, color, icon, isActive } = req.body
  if (description !== undefined) updates.description = description
  if (color) updates.color = color
  if (icon) updates.icon = icon
  if (isActive !== undefined) updates.is_active = isActive

  await supabase.from('streams').update(updates).eq('id', req.params.id)

  await createAuditLog({ userId: req.user.id, action: 'STREAM_UPDATED', entity: 'Stream', entityId: req.params.id, ipAddress: req.ip })

  const { data: updated } = await supabase.from('streams').select('*').eq('id', req.params.id).single()
  res.json(formatResponse({ ...updated, _id: updated.id }, 'Stream updated'))
})

// @desc    Delete stream (soft)
export const deleteStream = asyncHandler(async (req, res) => {
  const { data: stream } = await supabase.from('streams').select('id').eq('id', req.params.id).single()
  if (!stream) { res.status(404); throw new Error('Stream not found') }

  await supabase.from('streams').update({ is_active: false }).eq('id', req.params.id)

  await createAuditLog({ userId: req.user.id, action: 'STREAM_DELETED', entity: 'Stream', entityId: req.params.id, ipAddress: req.ip })

  res.json(formatResponse(null, 'Stream deactivated'))
})

// @desc    Assign faculty to stream
export const assignFaculty = asyncHandler(async (req, res) => {
  const { facultyId } = req.body

  const { data: stream } = await supabase.from('streams').select('id').eq('id', req.params.id).single()
  if (!stream) { res.status(404); throw new Error('Stream not found') }

  // Upsert into junction table (ignore if exists)
  await supabase.from('stream_faculty').upsert({ stream_id: req.params.id, faculty_id: facultyId }, { onConflict: 'stream_id,faculty_id' })

  await createAuditLog({ userId: req.user.id, action: 'FACULTY_ASSIGNED', entity: 'Stream', entityId: req.params.id, details: { facultyId }, ipAddress: req.ip })

  const { data: updated } = await supabase.from('streams').select('*').eq('id', req.params.id).single()
  res.json(formatResponse({ ...updated, _id: updated.id }, 'Faculty assigned'))
})
