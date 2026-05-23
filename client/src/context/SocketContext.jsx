import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const { user, isAuthenticated } = useAuthStore()
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        withCredentials: true
      })

      newSocket.on('connect', () => {
        newSocket.emit('join_room', {
          userId: user._id,
          role: user.role,
          streamId: null
        })
      })

      // Listen for events
      newSocket.on('new_notification', (notification) => {
        addNotification(notification)
        toast(notification.title, { icon: notification.icon || '🔔' })
      })

      newSocket.on('new_submission', (data) => {
        toast(`New submission: ${data.studentName}`, { icon: '📤' })
      })

      newSocket.on('feedback_added', (data) => {
        toast('New feedback received!', { icon: '📝' })
      })

      newSocket.on('submission_approved', () => {
        toast.success('Your submission was approved! ✅')
      })

      newSocket.on('needs_improvement', () => {
        toast('Submission needs improvement', { icon: '⚠️' })
      })

      newSocket.on('missing_alert', () => {
        toast.error('Missing submission alert! Submit your work now.')
      })

      newSocket.on('ai_analysis_complete', (data) => {
        toast.success(`AI Score: ${data.score}/100`)
      })

      newSocket.on('new_badge', (data) => {
        toast(`Badge earned! ${data.badge?.icon || '🏆'}`, { duration: 5000 })
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    }
  }, [isAuthenticated, user?._id])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocketContext = () => useContext(SocketContext)
export default SocketContext
