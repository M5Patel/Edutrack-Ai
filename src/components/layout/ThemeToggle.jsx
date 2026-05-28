import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import useTheme from '../../hooks/useTheme'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl hover:bg-surface-3 transition-all duration-300"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180, scale: 1 }}
        transition={{ duration: 0.3, type: 'spring' }}
      >
        {theme === 'dark' ? (
          <Sun size={20} className="text-yellow-400" />
        ) : (
          <Moon size={20} className="text-indigo-500" />
        )}
      </motion.div>
    </button>
  )
}

export default ThemeToggle
