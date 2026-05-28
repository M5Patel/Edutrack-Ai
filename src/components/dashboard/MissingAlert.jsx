import Card from '../ui/Card'
import { AlertTriangle } from 'lucide-react'

const MissingAlert = ({ students = [] }) => {
  if (students.length === 0) return null
  return (
    <Card className="border-red-500/30 bg-red-500/5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={18} className="text-red-500" />
        <h3 className="font-display font-bold text-red-500">Missing Submissions ({students.length})</h3>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {students.slice(0, 10).map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-xs text-red-500 font-bold">{(s.userId?.name || s.name || '?').charAt(0)}</span>
            <span>{s.userId?.name || s.name || 'Unknown'}</span>
          </div>
        ))}
        {students.length > 10 && <p className="text-xs text-[var(--text-muted)]">+{students.length - 10} more</p>}
      </div>
    </Card>
  )
}
export default MissingAlert
