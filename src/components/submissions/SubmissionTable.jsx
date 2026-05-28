import Table from '../ui/Table'
import StatusBadge from './StatusBadge'
import { formatDate } from '../../utils/helpers'

const SubmissionTable = ({ submissions, onRowClick }) => {
  const columns = [
    { header: 'Title', render: (row) => <span className="font-medium">{row.title}</span> },
    { header: 'Student', render: (row) => row.student?.userId?.name || 'Unknown' },
    { header: 'Stream', render: (row) => <span style={{ color: row.stream?.color }}>{row.stream?.name || 'N/A'}</span> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Date', render: (row) => formatDate(row.submissionDate) }
  ]
  return <Table columns={columns} data={submissions} onRowClick={onRowClick} />
}
export default SubmissionTable
