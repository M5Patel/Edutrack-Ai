import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../../services/analyticsService'
import PageTransition from '../../components/shared/PageTransition'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { Download, FileBarChart } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const Reports = () => {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateReport = async (type) => {
    setLoading(true)
    try {
      const { data } = await analyticsService.getReport({ type })
      setReport(data.data)
      toast.success('Report generated!')
    } catch { toast.error('Report generation failed') }
    finally { setLoading(false) }
  }

  const exportData = async () => {
    try {
      const { data } = await analyticsService.export({})
      const csv = data.data.map(r => Object.values(r).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'edutrack-report.csv'; a.click()
      toast.success('Exported!')
    } catch { toast.error('Export failed') }
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Reports</h1>
          <Button variant="secondary" onClick={exportData}><Download size={16} /> Export CSV</Button>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => generateReport('daily')} loading={loading}><FileBarChart size={16} /> Daily Report</Button>
          <Button onClick={() => generateReport('weekly')} loading={loading} variant="secondary"><FileBarChart size={16} /> Weekly Report</Button>
        </div>
        {report && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-display font-bold mb-3 text-[var(--text-primary)]">{report.period} Report</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-[var(--text-muted)]">Total Submissions:</span> <strong>{report.totalSubmissions}</strong></div>
                <div><span className="text-[var(--text-muted)]">Active Submitters:</span> <strong>{report.activeSubmitters}</strong></div>
                <div><span className="text-[var(--text-muted)]">Total Students:</span> <strong>{report.totalStudents}</strong></div>
              </div>
            </Card>
            <Card>
              <h3 className="font-display font-bold mb-3 text-[var(--text-primary)]">Executive Summary</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{report.executiveSummary}</p>
            </Card>
            {report.topPerformers?.length > 0 && (
              <Card>
                <h3 className="font-display font-bold mb-3 text-[var(--text-primary)]">Top Performers</h3>
                {report.topPerformers.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{i+1}. {p.name}</span>
                    <span className="text-sm text-primary font-bold">Avg: {p.avgScore}</span>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
export default Reports
