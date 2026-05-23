import Card from '../ui/Card'
import Avatar from '../ui/Avatar'

const Leaderboard = ({ data = [], title = 'Leaderboard' }) => (
  <Card>
    <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-4">{title}</h3>
    <div className="space-y-3">
      {data.slice(0, 10).map((entry, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-3 transition-colors">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' : i === 1 ? 'bg-gray-400/20 text-gray-400' : i === 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-surface-3 text-[var(--text-muted)]'}`}>
            {entry.rank || i + 1}
          </span>
          <Avatar name={entry.student?.userId?.name || entry.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{entry.student?.userId?.name || entry.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{entry.student?.stream?.name || ''}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary">{entry.compositeScore || entry.avgScore || 0}</p>
            <p className="text-xs text-[var(--text-muted)]">🔥 {entry.streak || 0}</p>
          </div>
        </div>
      ))}
      {data.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-4">No data</p>}
    </div>
  </Card>
)
export default Leaderboard
