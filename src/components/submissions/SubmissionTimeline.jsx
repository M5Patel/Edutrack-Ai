import { formatDate } from '../../utils/helpers'

const SubmissionTimeline = ({ versions = [] }) => (
  <div className="space-y-4">
    {versions.map((v, i) => (
      <div key={i} className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-primary" />
          {i < versions.length - 1 && <div className="w-0.5 flex-1 bg-[var(--border)]" />}
        </div>
        <div className="pb-4">
          <p className="text-sm font-medium text-[var(--text-primary)]">Version {versions.length - i}</p>
          <p className="text-xs text-[var(--text-muted)]">{formatDate(v.submittedAt)}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{v.files?.length || 0} files</p>
        </div>
      </div>
    ))}
  </div>
)
export default SubmissionTimeline
