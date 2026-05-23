import { FileX } from 'lucide-react'
const EmptyState = ({ title = 'No data found', description = 'Nothing to show here yet.', icon }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center mb-4">
      {icon || <FileX size={28} className="text-[var(--text-muted)]" />}
    </div>
    <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-1">{title}</h3>
    <p className="text-sm text-[var(--text-muted)] max-w-sm">{description}</p>
  </div>
)
export default EmptyState
