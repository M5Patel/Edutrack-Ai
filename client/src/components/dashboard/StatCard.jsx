import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Card from '../ui/Card'

const StatCard = ({ title, value, icon, color = 'primary', trend, suffix = '' }) => {
  const [count, setCount] = useState(0)
  const num = typeof value === 'number' ? value : parseInt(value) || 0

  useEffect(() => {
    let start = 0
    const duration = 1000
    const step = Math.ceil(num / (duration / 16))
    if (num === 0) return setCount(0)
    
    const timer = setInterval(() => {
      start += step
      if (start >= num) { setCount(num); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [num])

  const colors = {
    primary: 'bg-primary/20 text-primary-light border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]',
    accent: 'bg-accent/20 text-accent-light border border-accent/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
    purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
  }

  const bgColors = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    success: 'bg-emerald-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    purple: 'bg-purple-500'
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card hover className="relative overflow-hidden group">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-sm font-display text-[var(--text-muted)] mb-1">{title}</p>
            <h3 className="text-4xl font-display font-bold text-[var(--text-primary)]">{count}{suffix}</h3>
            {trend && <p className={`text-xs mt-2 font-medium ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week</p>}
          </div>
          <div className={`w-14 h-14 rounded-2xl ${colors[color]} flex items-center justify-center text-2xl`}>
            {icon}
          </div>
        </div>
        
        {/* Decorative background glow */}
        <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full ${bgColors[color]} opacity-20 blur-3xl group-hover:scale-150 transition-transform duration-700`} />
      </Card>
    </motion.div>
  )
}

export default StatCard
