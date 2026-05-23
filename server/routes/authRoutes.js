import express from 'express'
import { register, login, logout, refresh, getMe, updateProfile, changePassword } from '../controllers/authController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.post('/refresh', refresh)
router.get('/me', verifyToken, getMe)
router.put('/profile', verifyToken, updateProfile)
router.put('/password', verifyToken, changePassword)

export default router
