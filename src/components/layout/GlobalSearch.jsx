import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, LayoutDashboard, Users, GraduationCap, BookOpen, FileText, Settings, ClipboardCheck, BarChart3, FileBarChart, Upload, FolderOpen, TrendingUp, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../store/authStore'
import { NAV_ITEMS } from '../../utils/constants'

const iconMap = { LayoutDashboard, Users, GraduationCap, BookOpen, FileText, Settings, ClipboardCheck, BarChart3, FileBarChart, Upload, FolderOpen, TrendingUp, Bot }

const GlobalSearch = () => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Build searchable items from nav + extra shortcuts
  const items = useMemo(() => {
    const navItems = (NAV_ITEMS[user?.role] || []).map(item => ({
      label: item.label,
      path: item.path,
      icon: item.icon,
      type: 'Page',
      keywords: item.label.toLowerCase()
    }))

    // Add extra quick actions per role
    const extras = []
    if (user?.role === 'admin') {
      extras.push(
        { label: 'Add New Student', path: '/admin/students', icon: 'Users', type: 'Action', keywords: 'add create new student' },
        { label: 'Add New Faculty', path: '/admin/faculty', icon: 'GraduationCap', type: 'Action', keywords: 'add create new faculty teacher' },
        { label: 'Add New Stream', path: '/admin/streams', icon: 'BookOpen', type: 'Action', keywords: 'add create new stream course' },
        { label: 'View Audit Logs', path: '/admin/audit', icon: 'FileText', type: 'Action', keywords: 'audit logs history activity' }
      )
    }
    if (user?.role === 'student') {
      extras.push(
        { label: 'Submit New Work', path: '/student/submit', icon: 'Upload', type: 'Action', keywords: 'submit upload assignment work' },
        { label: 'View My Submissions', path: '/student/submissions', icon: 'FolderOpen', type: 'Action', keywords: 'my work submissions history' },
        { label: 'Talk to AI', path: '/student/ai', icon: 'Bot', type: 'Action', keywords: 'ai assistant chat help' }
      )
    }
    if (user?.role === 'faculty') {
      extras.push(
        { label: 'Review Submissions', path: '/faculty/review', icon: 'ClipboardCheck', type: 'Action', keywords: 'review grade submissions check' },
        { label: 'View Analytics', path: '/faculty/analytics', icon: 'BarChart3', type: 'Action', keywords: 'analytics stats charts performance' },
        { label: 'Generate Reports', path: '/faculty/reports', icon: 'FileBarChart', type: 'Action', keywords: 'reports generate export download' }
      )
    }

    return [...navItems, ...extras]
  }, [user?.role])

  // Filter results
  const results = useMemo(() => {
    if (!query.trim()) return items.slice(0, 6) // show top 6 by default
    const q = query.toLowerCase()
    return items.filter(item =>
      item.label.toLowerCase().includes(q) || item.keywords.includes(q)
    )
  }, [query, items])

  // Reset selection on filter change
  useEffect(() => { setSelectedIdx(0) }, [results])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Keyboard shortcut: Ctrl+K or /
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Keyboard navigation in dropdown
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      e.preventDefault()
      goTo(results[selectedIdx])
    }
  }

  const goTo = (item) => {
    navigate(item.path)
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  return (
    <div ref={containerRef} className="relative hidden md:block">
      {/* Search Input */}
      <div className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 w-80 transition-all duration-300 ${
        open 
          ? 'bg-[var(--surface-elevated)] shadow-lg shadow-primary/5 ring-2 ring-primary/30' 
          : 'bg-[var(--surface-3)] hover:bg-[var(--surface-elevated)]'
      }`}>
        <Search size={16} className="text-[var(--text-muted)] flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search pages..."
          className="bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] w-full"
        />
        {query ? (
          <button onClick={() => { setQuery(''); inputRef.current?.focus() }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X size={14} />
          </button>
        ) : (
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[var(--surface-3)] text-[var(--text-muted)] text-[10px] font-mono border border-[var(--border)]">
            Ctrl+K
          </kbd>
        )}
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 w-96 max-h-[400px] overflow-y-auto rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-2xl shadow-black/20 z-50"
          >
            {results.length === 0 ? (
              <div className="p-8 text-center">
                <Search size={32} className="mx-auto text-[var(--text-muted)] mb-3 opacity-40" />
                <p className="text-sm text-[var(--text-muted)]">No results for "<strong className="text-[var(--text-primary)]">{query}</strong>"</p>
              </div>
            ) : (
              <div className="p-2">
                {!query && <p className="px-3 py-1.5 text-[10px] font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider">Quick Navigation</p>}
                {query && <p className="px-3 py-1.5 text-[10px] font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider">{results.length} result{results.length !== 1 ? 's' : ''}</p>}
                {results.map((item, idx) => {
                  const Icon = iconMap[item.icon] || LayoutDashboard
                  return (
                    <button
                      key={item.path + item.label}
                      onClick={() => goTo(item)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                        idx === selectedIdx
                          ? 'bg-primary/10 text-primary'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        idx === selectedIdx ? 'bg-primary/20' : 'bg-[var(--surface-3)]'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${idx === selectedIdx ? 'text-primary' : 'text-[var(--text-primary)]'}`}>
                          {item.label}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">{item.type}</p>
                      </div>
                      <ArrowRight size={14} className={`flex-shrink-0 transition-all ${
                        idx === selectedIdx ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                      }`} />
                    </button>
                  )
                })}
              </div>
            )}
            <div className="border-t border-[var(--border)] px-4 py-2 flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-muted)]">↑↓ Navigate</span>
              <span className="text-[10px] text-[var(--text-muted)]">↵ Open</span>
              <span className="text-[10px] text-[var(--text-muted)]">Esc Close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GlobalSearch
