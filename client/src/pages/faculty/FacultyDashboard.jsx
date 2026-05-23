import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../../services/analyticsService'
import { submissionService } from '../../services/submissionService'
import StatCard from '../../components/dashboard/StatCard'
import MissingAlert from '../../components/dashboard/MissingAlert'
import PageTransition from '../../components/shared/PageTransition'
import Card from '../../components/ui/Card'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import useTheme from '../../hooks/useTheme'

const FacultyDashboard = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const axisColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'
  const tickColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)'
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const tooltipText = isDark ? '#fff' : '#0F172A'

  const { data: daily, isLoading: loadingDaily } = useQuery({ queryKey: ['faculty-daily'], queryFn: async () => { const { data } = await analyticsService.getDaily(); return data.data } })
  const { data: streamsData, isLoading: loadingStreams } = useQuery({ queryKey: ['streams-analytics'], queryFn: async () => { const { data } = await analyticsService.getStreams(); return data.data } })
  const { data: missing, isLoading: loadingMissing } = useQuery({ queryKey: ['missing'], queryFn: async () => { const { data } = await submissionService.getMissing(); return data.data } })

  if (loadingDaily || loadingStreams || loadingMissing) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>

  const barData = streamsData?.map(s => ({ name: s.stream?.code || s.stream?.name, submissions: s.submissionCount, score: s.avgScore })) || []

  return (
    <PageTransition>
      <div className="space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-[32px] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] -z-10 translate-x-32 -translate-y-32"></div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs mb-3 font-display">
              <BookOpen size={14} /> Faculty Portal
            </div>
            <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-2">Faculty <span className="gradient-text">Dashboard</span></h1>
            <p className="text-[var(--text-muted)] font-light">Monitor your students' performance and daily submissions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard title="Total Students" value={daily?.totalStudents || 0} icon="🎓" color="primary" />
          <StatCard title="Submitted Today" value={daily?.submitted || 0} icon="✅" color="success" />
          <StatCard title="Missing Today" value={daily?.missing || 0} icon="⚠️" color="danger" />
          <StatCard title="Submission Rate" value={daily?.rate || 0} icon="📊" color="accent" suffix="%" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="rounded-[32px] p-8">
            <h3 className="font-display font-bold text-xl mb-6 text-[var(--text-primary)] flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Submissions by Stream</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke={axisColor} fontSize={12} tick={{fill: tickColor}} />
                  <YAxis stroke={axisColor} fontSize={12} tick={{fill: tickColor}} />
                  <Tooltip contentStyle={{ background: tooltipBg, backdropFilter: 'blur(12px)', border: `1px solid ${tooltipBorder}`, borderRadius: '16px', color: tooltipText }} itemStyle={{ color: tooltipText }} />
                  <Bar dataKey="submissions" fill="#8B5CF6" radius={[6,6,0,0]} />
                  <Bar dataKey="score" fill="#06B6D4" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <MissingAlert students={missing || []} />
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
export default FacultyDashboard
