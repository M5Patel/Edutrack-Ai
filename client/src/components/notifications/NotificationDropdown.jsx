import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import useNotificationStore from '../../store/notificationStore'
import { notificationService } from '../../services/notificationService'
import { formatRelative } from '../../utils/helpers'
import { Check, CheckCheck } from 'lucide-react'

const NotificationDropdown = ({ onClose }) => {
  const ref = useRef()
  const { notifications, setNotifications, setUnreadCount, markRead, markAllRead } = useNotificationStore()

  useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await notificationService.getAll({ limit: 20 })
      setNotifications(data.data)
      const countRes = await notificationService.getUnreadCount()
      setUnreadCount(countRes.data.data.count)
      return data.data
    }
  })

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  const handleMarkAll = async () => {
    await notificationService.markAllRead()
    markAllRead()
  }

  const handleRead = async (id) => {
    await notificationService.markRead(id)
    markRead(id)
  }

  return (
    <div ref={ref} className="absolute right-0 mt-2 w-80 bg-surface-2 border border-[var(--border)] rounded-2xl shadow-2xl z-50 animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <h3 className="font-display font-bold text-sm">Notifications</h3>
        <button onClick={handleMarkAll} className="text-xs text-primary hover:underline flex items-center gap-1"><CheckCheck size={14} /> Mark all read</button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-center py-8 text-sm text-[var(--text-muted)]">No notifications</p>
        ) : notifications.map((n) => (
          <div key={n._id} onClick={() => handleRead(n._id)} className={`flex items-start gap-3 p-3 hover:bg-surface-3 cursor-pointer transition-colors border-b border-[var(--border)] last:border-0 ${!n.isRead ? 'bg-primary/5' : ''}`}>
            <span className="text-lg flex-shrink-0">{n.icon || '🔔'}</span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${!n.isRead ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{n.title}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{n.message}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{formatRelative(n.createdAt)}</p>
            </div>
            {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}
export default NotificationDropdown
