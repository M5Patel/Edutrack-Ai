import express from 'express'
import { getOverview, getStreamsAnalytics, getStreamAnalytics, getStudentPerformance, getDailyAnalytics, getWeeklyAnalytics, exportAnalytics, getReport } from '../controllers/analyticsController.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.use(verifyToken)

router.get('/overview', allowRoles('admin'), getOverview)
router.get('/streams', allowRoles('admin', 'faculty'), getStreamsAnalytics)
router.get('/stream/:id', allowRoles('admin', 'faculty'), getStreamAnalytics)
router.get('/student/:id', getStudentPerformance)
router.get('/daily', allowRoles('admin', 'faculty'), getDailyAnalytics)
router.get('/weekly', allowRoles('admin', 'faculty'), getWeeklyAnalytics)
router.get('/report', allowRoles('admin', 'faculty'), getReport)
router.get('/export', allowRoles('admin', 'faculty'), exportAnalytics)

export default router
