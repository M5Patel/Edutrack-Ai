import express from 'express'
import { getStreams, createStream, getStreamById, updateStream, deleteStream, assignFaculty } from '../controllers/streamController.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.use(verifyToken)

router.get('/', getStreams)
router.post('/', allowRoles('admin'), createStream)
router.get('/:id', getStreamById)
router.put('/:id', allowRoles('admin'), updateStream)
router.delete('/:id', allowRoles('admin'), deleteStream)
router.post('/:id/assign-faculty', allowRoles('admin'), assignFaculty)

export default router
