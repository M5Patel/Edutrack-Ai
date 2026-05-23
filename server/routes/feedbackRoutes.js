import express from 'express'
import { addFeedback, getFeedback, updateFeedback, deleteFeedback } from '../controllers/feedbackController.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'
import { feedbackValidator, handleValidationErrors } from '../utils/validators.js'

const router = express.Router()

router.use(verifyToken)

router.post('/:submissionId', allowRoles('faculty'), feedbackValidator, handleValidationErrors, addFeedback)
router.get('/:submissionId', getFeedback)
router.put('/:id', allowRoles('faculty'), updateFeedback)
router.delete('/:id', allowRoles('admin'), deleteFeedback)

export default router
