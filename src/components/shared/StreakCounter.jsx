import { motion } from 'framer-motion'

const StreakCounter = ({ streak = 0 }) => (
  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-5 py-3">
    <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: streak > 0 ? Infinity : 0, repeatDelay: 2 }} className="text-2xl">🔥</motion.span>
    <div>
      <p className="text-2xl font-display font-bold text-orange-500">{streak}</p>
      <p className="text-xs text-[var(--text-muted)]">day streak</p>
    </div>
  </motion.div>
)
export default StreakCounter
