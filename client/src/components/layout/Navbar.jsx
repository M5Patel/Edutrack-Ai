import { Menu, LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import GlobalSearch from './GlobalSearch'
import NotificationBell from '../notifications/NotificationBell'
import useAuthStore from '../../store/authStore'
import { useAuthContext } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuthStore()
  const { logoutUser } = useAuthContext()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-surface-2 border-b border-[var(--border)] flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-surface-3 transition-colors">
          <Menu size={20} className="text-[var(--text-secondary)]" />
        </button>
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationBell />
        <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-surface-3 transition-colors text-[var(--text-secondary)] hover:text-red-500" title="Logout">
          <LogOut size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-[var(--border)]">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {user?.name?.charAt(0) || '?'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name}</p>
            <p className="text-xs text-[var(--text-muted)] capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
