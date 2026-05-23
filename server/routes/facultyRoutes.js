import express from 'express'
import { getFaculty, createFaculty, getFacultyById, updateFaculty, deleteFaculty } from '../controllers/facultyController.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.use(verifyToken)

router.get('/', allowRoles('admin'), getFaculty)
router.post('/', allowRoles('admin'), createFaculty)
router.get('/:id', getFacultyById)
router.put('/:id', allowRoles('admin'), updateFaculty)
router.delete('/:id', allowRoles('admin'), deleteFaculty)

export default router
