import Card from '../ui/Card'
import StatusBadge from './StatusBadge'
import { formatDate } from '../../utils/helpers'

const SubmissionCard = ({ submission, onClick }) => (
  <Card hover className="cursor-pointer" onClick={() => onClick?.(submission)}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-semibold text-[var(--text-primary)] truncate">{submission.title}</h4>
        <p className="text-xs text-[var(--text-muted)] mt-1">{submission.student?.userId?.name || 'Unknown'}</p>
      </div>
      <StatusBadge status={submission.status} />
    </div>
    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">{submission.description || 'No description'}</p>
    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
      <span>{submission.stream?.name || 'Unknown'}</span>
      <div className="flex items-center gap-3">
        <span>{formatDate(submission.submissionDate)}</span>
      </div>
    </div>
    {submission.files?.length > 0 && (
      <div className="mt-3 flex gap-1"> {submission.files.map((f, i) => <span key={i} className="text-xs bg-surface-3 px-2 py-0.5 rounded-full text-[var(--text-muted)]">{f.fileName?.split('.').pop()}</span>)}</div>
    )}
  </Card>
)
export default SubmissionCard
