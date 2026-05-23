import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { studentService } from '../../services/studentService'
import { analyticsService } from '../../services/analyticsService'
import PageTransition from '../../components/shared/PageTransition'
import SubmissionHeatmap from '../../components/dashboard/SubmissionHeatmap'
import Leaderboard from '../../components/shared/Leaderboard'
import Card from '../../components/ui/Card'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const StudentAnalytics = () => {
  const [selectedId, setSelectedId] = useState('')

  const { data: students } = useQuery({ queryKey: ['students-list'], queryFn: async () => { const { data } = await studentService.getAll({ limit: 100 }); return data.data } })
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['student-perf', selectedId],
    queryFn: async () => { if (!selectedId) return null; const { data } = await analyticsService.getStudent(selectedId); return data.data },
    enabled: !!selectedId
  })
  const { data: leaderboard } = useQuery({ queryKey: ['leaderboard'], queryFn: async () => { const { data } = await studentService.getLeaderboard({}); return data.data } })

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Student Analytics</h1>
        <div className="flex gap-4 flex-wrap">
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="input-field max-w-xs">
            <option value="">Select a student...</option>
            {(students || []).map(s => <option key={s._id} value={s._id}>{s.userId?.name} ({s.rollNumber})</option>)}
          </select>
        </div>
        {selectedId && isLoading && <SkeletonCard />}
        {analytics && (
          <div className="space-y-6">
            <SubmissionHeatmap data={{}} />
            <Card>
              <h3 className="font-display font-bold mb-4 text-[var(--text-primary)]">Score Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={(analytics.submissions || []).slice(0, 15).reverse().map(s => ({ title: s.title?.slice(0, 15), score: s.aiScore || 0 }))}>
                  <XAxis dataKey="title" stroke="var(--text-muted)" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}
        <Leaderboard data={leaderboard || []} />
      </div>
    </PageTransition>
  )
}
export default StudentAnalytics
