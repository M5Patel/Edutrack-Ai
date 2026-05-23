import { SUBMISSION_STATUSES } from '../../utils/constants'

const StatusBadge = ({ status }) => {
  const s = SUBMISSION_STATUSES[status] || { label: status, color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>{s.label}</span>
}
export default StatusBadge
