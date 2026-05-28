import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { initSocket } from './config/socket.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import facultyRoutes from './routes/facultyRoutes.js'
import submissionRoutes from './routes/submissionRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js'
import streamRoutes from './routes/streamRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import auditRoutes from './routes/auditRoutes.js'
import { startCronJobs } from './services/cronService.js'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const httpServer = createServer(app)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Socket.io
const io = initSocket(httpServer)
app.set('io', io)

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/faculty', facultyRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/streams', streamRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/audit', auditRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EduTrack AI API is running (Supabase)' })
})

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next()
    }
    res.sendFile(path.resolve(distPath, 'index.html'))
  })
}

// Error handling
app.use(notFound)
app.use(errorHandler)

if (!process.env.VERCEL) {
  // Start cron jobs
  startCronJobs(io)

  const PORT = process.env.PORT || 5000
  httpServer.listen(PORT, () => {
    console.log(`🚀 EduTrack AI Server running on port ${PORT}`)
    console.log(`✅ Connected to Supabase`)
  })
}

export default app
