import express from 'express'
import { getNotifications, markRead, markAllRead, deleteNotification, getUnreadCount } from '../controllers/notificationController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(verifyToken)

router.get('/', getNotifications)
router.get('/unread-count', getUnreadCount)
router.put('/read-all', markAllRead)
router.put('/:id/read', markRead)
router.delete('/:id', deleteNotification)

export default router
