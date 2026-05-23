import express from 'express'
import { getStudents, createStudent, getStudentById, updateStudent, deleteStudent, getStudentSubmissions, getStudentAnalytics, getLeaderboard } from '../controllers/studentController.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.use(verifyToken)

router.get('/leaderboard', getLeaderboard)
router.get('/', allowRoles('admin', 'faculty'), getStudents)
router.post('/', allowRoles('admin'), createStudent)
router.get('/:id', getStudentById)
router.put('/:id', allowRoles('admin'), updateStudent)
router.delete('/:id', allowRoles('admin'), deleteStudent)
router.get('/:id/submissions', getStudentSubmissions)
router.get('/:id/analytics', getStudentAnalytics)

export default router
