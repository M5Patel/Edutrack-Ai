import asyncHandler from 'express-async-handler'
import supabase from '../config/supabase.js'
import { getPagination, createAuditLog, formatResponse } from '../utils/helpers.js'

// @desc    Get all faculty
export const getFaculty = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)

  const { data, count, error } = await supabase
    .from('faculty')
    .select('*, user:profiles!user_id(id, name, email, avatar, is_active), streams:stream_faculty(stream:streams(*))', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(skip, skip + limit - 1)

  if (error) { res.status(400); throw new Error(error.message) }

  const mapped = (data || []).map(f => ({
    ...f, _id: f.id, userId: f.user,
    streams: f.streams?.map(sf => sf.stream) || []
  }))

  res.json(formatResponse(mapped, 'Faculty fetched', { total: count, page, pages: Math.ceil((count || 0) / limit) }))
})

// @desc    Create faculty
export const createFaculty = asyncHandler(async (req, res) => {
  const { name, email, password, department, phone } = req.body

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { name, role: 'faculty' }
  })
  if (authError) { res.status(400); throw new Error(authError.message) }

  await supabase.from('profiles').update({ name, role: 'faculty' }).eq('id', authData.user.id)

  const { data: faculty, error } = await supabase.from('faculty').insert({
    user_id: authData.user.id, department, phone
  }).select().single()
  if (error) { res.status(400); throw new Error(error.message) }

  await createAuditLog({ userId: req.user.id, action: 'FACULTY_CREATED', entity: 'Faculty', entityId: faculty.id, ipAddress: req.ip })

  res.status(201).json(formatResponse({ ...faculty, _id: faculty.id }, 'Faculty created'))
})

// @desc    Get faculty by ID
export const getFacultyById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('faculty')
    .select('*, user:profiles!user_id(id, name, email, avatar, is_active, last_login), streams:stream_faculty(stream:streams(*))')
    .eq('id', req.params.id)
    .single()

  if (error || !data) { res.status(404); throw new Error('Faculty not found') }
  res.json(formatResponse({ ...data, _id: data.id, userId: data.user, streams: data.streams?.map(sf => sf.stream) || [] }))
})

// @desc    Update faculty
export const updateFaculty = asyncHandler(async (req, res) => {
  const { data: faculty } = await supabase.from('faculty').select('user_id').eq('id', req.params.id).single()
  if (!faculty) { res.status(404); throw new Error('Faculty not found') }

  const { name, email, department, phone, bio } = req.body
  if (name || email) {
    const profileUpdate = {}
    if (name) profileUpdate.name = name
    if (email) profileUpdate.email = email
    await supabase.from('profiles').update(profileUpdate).eq('id', faculty.user_id)
  }

  const facultyUpdate = {}
  if (department) facultyUpdate.department = department
  if (phone) facultyUpdate.phone = phone
  if (bio) facultyUpdate.bio = bio
  if (Object.keys(facultyUpdate).length > 0) {
    await supabase.from('faculty').update(facultyUpdate).eq('id', req.params.id)
  }

  await createAuditLog({ userId: req.user.id, action: 'FACULTY_UPDATED', entity: 'Faculty', entityId: req.params.id, ipAddress: req.ip })

  const { data: updated } = await supabase.from('faculty').select('*').eq('id', req.params.id).single()
  res.json(formatResponse({ ...updated, _id: updated.id }, 'Faculty updated'))
})

// @desc    Delete faculty (soft)
export const deleteFaculty = asyncHandler(async (req, res) => {
  const { data: faculty } = await supabase.from('faculty').select('user_id').eq('id', req.params.id).single()
  if (!faculty) { res.status(404); throw new Error('Faculty not found') }

  await supabase.from('profiles').update({ is_active: false }).eq('id', faculty.user_id)

  await createAuditLog({ userId: req.user.id, action: 'FACULTY_DELETED', entity: 'Faculty', entityId: req.params.id, ipAddress: req.ip })

  res.json(formatResponse(null, 'Faculty deactivated'))
})
