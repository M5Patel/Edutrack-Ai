import asyncHandler from 'express-async-handler'
import supabase from '../config/supabase.js'
import { createAuditLog, formatResponse } from '../utils/helpers.js'

// @desc    Register user
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, rollNumber, stream, batch, phone, department } = req.body

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: role || 'student' }
  })

  if (authError) {
    res.status(400)
    throw new Error(authError.message)
  }

  const userId = authData.user.id

  // Profile is auto-created by trigger, but update if needed
  await supabase.from('profiles').update({ name, role: role || 'student' }).eq('id', userId)

  // Create role-specific record
  if (role === 'student') {
    if (!rollNumber || !batch) {
      res.status(400)
      throw new Error('Roll number and batch are required for students')
    }
    const { error } = await supabase.from('students').insert({
      user_id: userId,
      roll_number: rollNumber,
      stream_id: stream || null,
      batch,
      phone
    })
    if (error) { res.status(400); throw new Error(error.message) }
  } else if (role === 'faculty') {
    const { error } = await supabase.from('faculty').insert({
      user_id: userId,
      department,
      phone
    })
    if (error) { res.status(400); throw new Error(error.message) }
  }

  await createAuditLog({ userId, action: 'USER_REGISTERED', entity: 'User', entityId: userId, details: { role } })

  // Sign in to get session token
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    res.status(400)
    throw new Error(signInError.message)
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: profile,
      accessToken: signInData.session.access_token,
      refreshToken: signInData.session.refresh_token
    }
  })
})

// @desc    Login user
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  const userId = data.user.id

  // Check active status
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (!profile?.is_active) {
    res.status(403)
    throw new Error('Account is deactivated. Contact administrator.')
  }

  // Update last login
  await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', userId)

  await createAuditLog({ userId, action: 'USER_LOGIN', entity: 'User', entityId: userId, ipAddress: req.ip })

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: profile,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    }
  })
})

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' })
})

// @desc    Refresh token
// @route   POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) {
    res.status(401)
    throw new Error('No refresh token')
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
  if (error) {
    res.status(403)
    throw new Error('Invalid refresh token')
  }

  res.json({
    success: true,
    data: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    }
  })
})

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', req.user.id).single()
  let roleProfile = null

  if (profile.role === 'student') {
    const { data } = await supabase
      .from('students')
      .select('*, stream:streams(*), badges:student_badges(badge:badges(*))')
      .eq('user_id', req.user.id)
      .single()
    if (data) {
      roleProfile = {
        ...data,
        badges: data.badges?.map(b => b.badge) || []
      }
    }
  } else if (profile.role === 'faculty') {
    const { data } = await supabase
      .from('faculty')
      .select('*, streams:stream_faculty(stream:streams(*))')
      .eq('user_id', req.user.id)
      .single()
    if (data) {
      roleProfile = {
        ...data,
        streams: data.streams?.map(sf => sf.stream) || []
      }
    }
  }

  res.json({
    success: true,
    data: { user: profile, profile: roleProfile }
  })
})

// @desc    Update profile
// @route   PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar, phone } = req.body

  const updates = {}
  if (name) updates.name = name
  if (avatar) updates.avatar = avatar

  if (Object.keys(updates).length > 0) {
    await supabase.from('profiles').update(updates).eq('id', req.user.id)
  }

  if (phone) {
    if (req.user.role === 'student') {
      await supabase.from('students').update({ phone }).eq('user_id', req.user.id)
    } else if (req.user.role === 'faculty') {
      await supabase.from('faculty').update({ phone }).eq('user_id', req.user.id)
    }
  }

  await createAuditLog({ userId: req.user.id, action: 'PROFILE_UPDATED', entity: 'User', entityId: req.user.id, ipAddress: req.ip })

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', req.user.id).single()
  res.json({ success: true, message: 'Profile updated', data: { user: profile } })
})

// @desc    Change password
// @route   PUT /api/auth/password
export const changePassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body

  const { error } = await supabase.auth.admin.updateUserById(req.user.id, { password: newPassword })
  if (error) {
    res.status(400)
    throw new Error(error.message)
  }

  await createAuditLog({ userId: req.user.id, action: 'PASSWORD_CHANGED', entity: 'User', entityId: req.user.id, ipAddress: req.ip })

  res.json({ success: true, message: 'Password changed successfully' })
})
