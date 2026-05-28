import { Bell } from 'lucide-react'
import { useState } from 'react'
import useNotificationStore from '../../store/notificationStore'
import NotificationDropdown from './NotificationDropdown'

const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const { unreadCount } = useNotificationStore()

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl hover:bg-surface-3 transition-colors">
        <Bell size={20} className="text-[var(--text-secondary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  )
}
export default NotificationBell
