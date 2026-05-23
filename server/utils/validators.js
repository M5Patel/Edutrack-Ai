import { body, param, query, validationResult } from 'express-validator'

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'faculty', 'student']).withMessage('Invalid role')
]

export const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
]

export const submissionValidator = [
  body('title').trim().notEmpty().withMessage('Title is required')
]

export const feedbackValidator = [
  body('remarks').trim().notEmpty().withMessage('Remarks are required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5')
]

export const streamValidator = [
  body('name').trim().notEmpty().withMessage('Stream name is required'),
  body('code').trim().notEmpty().withMessage('Stream code is required')
]

export const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
]

export const uuidValidator = (paramName) => [
  param(paramName).isUUID().withMessage(`Invalid ${paramName}`)
]

// Validation error handler middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() })
  }
  next()
}
