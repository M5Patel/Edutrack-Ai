import asyncHandler from 'express-async-handler'
import supabase from '../config/supabase.js'
import { formatResponse } from '../utils/helpers.js'

// Rewrite auditRoutes to use Supabase directly
import express from 'express'
import { verifyToken } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'
import { getPagination } from '../utils/helpers.js'

const router = express.Router()

router.get('/', verifyToken, allowRoles('admin'), asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)
  const { action, entity, userId } = req.query

  let query = supabase
    .from('audit_logs')
    .select('*, user:profiles!user_id(name, email)', { count: 'exact' })

  if (action) query = query.eq('action', action)
  if (entity) query = query.eq('entity', entity)
  if (userId) query = query.eq('user_id', userId)

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(skip, skip + limit - 1)

  if (error) { res.status(400); throw new Error(error.message) }

  const mapped = (data || []).map(log => ({
    ...log, _id: log.id,
    user: log.user
  }))

  res.json(formatResponse(mapped, 'Audit logs fetched', { total: count, page, pages: Math.ceil((count || 0) / limit) }))
}))

export default router
