import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Upload, FolderOpen, TrendingUp, Bot, ClipboardCheck, BarChart3, Users, BookOpen } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const mobileItems = {
  student: [
    { path: '/student/dashboard', icon: LayoutDashboard, label: 'Home' },
    { path: '/student/submit', icon: Upload, label: 'Submit' },
    { path: '/student/submissions', icon: FolderOpen, label: 'Work' },
    { path: '/student/progress', icon: TrendingUp, label: 'Progress' },
    { path: '/student/ai', icon: Bot, label: 'AI' }
  ],
  faculty: [
    { path: '/faculty/dashboard', icon: LayoutDashboard, label: 'Home' },
    { path: '/faculty/review', icon: ClipboardCheck, label: 'Review' },
    { path: '/faculty/analytics', icon: BarChart3, label: 'Analytics' }
  ],
  admin: [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Home' },
    { path: '/admin/students', icon: Users, label: 'Students' },
    { path: '/admin/streams', icon: BookOpen, label: 'Streams' }
  ]
}

const MobileNav = () => {
  const { user } = useAuthStore()
  const items = mobileItems[user?.role] || []

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-2 border-t border-[var(--border)] px-2 py-1 z-50">
      <div className="flex items-center justify-around">
        {items.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-[var(--text-muted)]'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default MobileNav
