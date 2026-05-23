import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, LayoutDashboard, Users, GraduationCap, BookOpen, FileText, Settings, ClipboardCheck, BarChart3, FileBarChart, Upload, FolderOpen, TrendingUp, Bot } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { NAV_ITEMS } from '../../utils/constants'

const iconMap = { LayoutDashboard, Users, GraduationCap, BookOpen, FileText, Settings, ClipboardCheck, BarChart3, FileBarChart, Upload, FolderOpen, TrendingUp, Bot }

const NavItem = ({ item, isOpen, hoveredItem, onHover, onLeave }) => {
  const Icon = iconMap[item.icon] || LayoutDashboard

  return (
    <NavLink
      to={item.path}
      onMouseEnter={() => onHover(item.path)}
      onMouseLeave={onLeave}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
          isActive
            ? 'text-primary'
            : 'text-[var(--text-secondary)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Animated hover background */}
          <AnimatePresence>
            {(hoveredItem === item.path && !isActive) && (
              <motion.div
                layoutId="nav-hover"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="absolute inset-0 rounded-xl"
                style={{ background: 'var(--surface-3)', opacity: 0.7 }}
              />
            )}
          </AnimatePresence>

          {/* Active item background with gradient accent */}
          {isActive && (
            <motion.div
              layoutId="nav-active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="absolute inset-0 rounded-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/10" />
              {/* Left accent bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: '60%' }}
                transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-gradient-to-b from-primary to-accent"
              />
            </motion.div>
          )}

          {/* Icon with hover animation */}
          <motion.div
            className="relative z-10 flex-shrink-0"
            whileHover={{ scale: 1.15, rotate: isActive ? 0 : -5 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Icon
              size={20}
              className={`transition-colors duration-200 ${
                isActive
                  ? 'text-primary drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]'
                  : 'group-hover:text-[var(--text-primary)]'
              }`}
            />
          </motion.div>

          {/* Label with slide-in effect */}
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className={`relative z-10 truncate transition-colors duration-200 ${
                isActive
                  ? 'font-semibold'
                  : 'group-hover:text-[var(--text-primary)]'
              }`}
            >
              {item.label}
            </motion.span>
          )}

          {/* Tooltip for collapsed sidebar */}
          {!isOpen && (
            <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] text-[var(--text-primary)] text-xs font-medium shadow-lg border border-[var(--border)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 translate-x-1 group-hover:translate-x-0">
              {item.label}
            </div>
          )}
        </>
      )}
    </NavLink>
  )
}

const Sidebar = ({ isOpen, onToggle }) => {
  const { user } = useAuthStore()
  const items = NAV_ITEMS[user?.role] || []
  const [hoveredItem, setHoveredItem] = useState(null)

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 260 : 72 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="h-screen bg-surface-2 border-r border-[var(--border)] flex flex-col relative"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
        <motion.div
          whileHover={{ scale: 1.05, rotate: -3 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
        >
          E
        </motion.div>
        {isOpen && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <h1 className="font-display font-bold text-lg text-[var(--text-primary)]">EduTrack</h1>
            <p className="text-xs text-[var(--text-muted)]">AI Powered</p>
          </motion.div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isOpen={isOpen}
            hoveredItem={hoveredItem}
            onHover={setHoveredItem}
            onLeave={() => setHoveredItem(null)}
          />
        ))}
      </nav>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white shadow-[0_0_12px_rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-shadow"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </motion.button>

      {/* User Section */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 ring-2 ring-primary/20"
          >
            {user?.name?.charAt(0) || '?'}
          </motion.div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name}</p>
              <p className="text-xs text-[var(--text-muted)] capitalize">{user?.role}</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar
