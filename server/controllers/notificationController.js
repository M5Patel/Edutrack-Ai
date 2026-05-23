import asyncHandler from 'express-async-handler'
import supabase from '../config/supabase.js'
import { getPagination, formatResponse } from '../utils/helpers.js'

// @desc    Get user notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)

  const { data, count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('recipient_id', req.user.id)
    .order('created_at', { ascending: false })
    .range(skip, skip + limit - 1)

  if (error) { res.status(400); throw new Error(error.message) }

  res.json(formatResponse(
    (data || []).map(n => ({ ...n, _id: n.id })),
    'Notifications fetched',
    { total: count, page, pages: Math.ceil((count || 0) / limit) }
  ))
})

// @desc    Mark read
export const markRead = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) { res.status(404); throw new Error('Not found') }
  res.json(formatResponse({ ...data, _id: data.id }, 'Marked as read'))
})

// @desc    Mark all read
export const markAllRead = asyncHandler(async (req, res) => {
  await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', req.user.id).eq('is_read', false)
  res.json(formatResponse(null, 'All marked as read'))
})

// @desc    Delete notification
export const deleteNotification = asyncHandler(async (req, res) => {
  await supabase.from('notifications').delete().eq('id', req.params.id)
  res.json(formatResponse(null, 'Notification deleted'))
})

// @desc    Get unread count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const { count } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('recipient_id', req.user.id).eq('is_read', false)
  res.json(formatResponse({ count }))
})
