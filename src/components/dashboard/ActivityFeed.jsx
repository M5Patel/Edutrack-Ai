import Card from '../ui/Card'
import { formatRelative } from '../../utils/helpers'

const ActivityFeed = ({ activities = [] }) => (
  <Card>
    <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-4">Recent Activity</h3>
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {activities.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-8">No recent activity</p>
      ) : activities.map((a, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-3 transition-colors">
          <span className="text-lg flex-shrink-0">{a.icon || '📌'}</span>
          <div className="min-w-0">
            <p className="text-sm text-[var(--text-primary)] truncate">{a.title || a.message}</p>
            <p className="text-xs text-[var(--text-muted)]">{formatRelative(a.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
)
export default ActivityFeed
