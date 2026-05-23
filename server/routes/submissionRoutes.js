import express from 'express'
import { getSubmissions, createSubmission, getSubmissionById, updateSubmission, deleteSubmission, updateSubmissionStatus, getTodaySubmissions, getMissingSubmissions } from '../controllers/submissionController.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.use(verifyToken)

router.get('/today', getTodaySubmissions)
router.get('/missing', allowRoles('admin', 'faculty'), getMissingSubmissions)
router.get('/', allowRoles('admin', 'faculty'), getSubmissions)
router.post('/', allowRoles('student'), upload.array('files', 5), createSubmission)
router.get('/:id', getSubmissionById)
router.put('/:id', allowRoles('student'), upload.array('files', 5), updateSubmission)
router.delete('/:id', allowRoles('admin'), deleteSubmission)
router.put('/:id/status', allowRoles('faculty', 'admin'), updateSubmissionStatus)

export default router
