import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import PageTransition from '../../components/shared/PageTransition'
import Table from '../../components/ui/Table'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { formatDate } from '../../utils/helpers'

const AuditLog = () => {
  const { data, isLoading } = useQuery({ queryKey: ['audit'], queryFn: async () => { const { data } = await api.get('/audit?limit=50'); return data.data } })
  const columns = [
    { header: 'User', render: (r) => r.user?.name || 'System' },
    { header: 'Action', render: (r) => <span className="font-mono text-xs bg-surface-3 px-2 py-0.5 rounded">{r.action}</span> },
    { header: 'Entity', render: (r) => r.entity || '-' },
    { header: 'Date', render: (r) => formatDate(r.createdAt) },
    { header: 'IP', render: (r) => r.ipAddress || '-' }
  ]
  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Audit Log</h1>
        {isLoading ? <SkeletonCard /> : <Table columns={columns} data={data || []} />}
      </div>
    </PageTransition>
  )
}
export default AuditLog
