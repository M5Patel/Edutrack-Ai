import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', duration: 0.3 }}
            className={`relative bg-surface-2 border border-[var(--border)] rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">{title}</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-3 transition-colors text-[var(--text-muted)]">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
export default Modal
