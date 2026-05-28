import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../../services/analyticsService'
import { submissionService } from '../../services/submissionService'
import { studentService } from '../../services/studentService'
import { notificationService } from '../../services/notificationService'
import StatCard from '../../components/dashboard/StatCard'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import MissingAlert from '../../components/dashboard/MissingAlert'
import Leaderboard from '../../components/shared/Leaderboard'
import PageTransition from '../../components/shared/PageTransition'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Card from '../../components/ui/Card'
import { Shield } from 'lucide-react'
import useTheme from '../../hooks/useTheme'

const COLORS = ['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EF4444']

const AdminDashboard = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const axisColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'
  const tickColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)'
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const tooltipText = isDark ? '#fff' : '#0F172A'

  const { data: overview, isLoading } = useQuery({ queryKey: ['admin-overview'], queryFn: async () => { const { data } = await analyticsService.getOverview(); return data.data } })
  const { data: missing } = useQuery({ queryKey: ['missing'], queryFn: async () => { const { data } = await submissionService.getMissing(); return data.data } })
  const { data: leaderboard } = useQuery({ queryKey: ['leaderboard'], queryFn: async () => { const { data } = await studentService.getLeaderboard({}); return data.data } })
  const { data: streamsData } = useQuery({ queryKey: ['streams-analytics'], queryFn: async () => { const { data } = await analyticsService.getStreams(); return data.data } })
  const { data: notifications } = useQuery({ queryKey: ['admin-notifications'], queryFn: async () => { const { data } = await notificationService.getAll({ limit: 20 }); return data.data } })

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({length:6}).map((_,i) => <SkeletonCard key={i} />)}</div>

  const barData = streamsData?.map(s => ({ name: s.stream?.code || s.stream?.name, submissions: s.submissionCount, score: s.avgScore })) || []
  const pieData = [
    { name: 'Submitted', value: overview?.submissionsToday || 0 },
    { name: 'Missing', value: overview?.missingToday || 0 }
  ]

  return (
    <PageTransition>
      <div className="space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-[32px] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10 translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-[60px] -z-10 -translate-x-24 translate-y-24"></div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs mb-3 font-display">
              <Shield size={14} /> Admin Portal
            </div>
            <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-2">Institute <span className="gradient-text">Overview</span></h1>
            <p className="text-[var(--text-muted)] font-light">Global statistics and management for EduTrack AI.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard title="Total Students" value={overview?.totalStudents || 0} icon="🎓" color="primary" />
          <StatCard title="Total Faculty" value={overview?.totalFaculty || 0} icon="👨‍🏫" color="accent" />
          <StatCard title="Streams" value={overview?.totalStreams || 0} icon="📚" color="success" />
          <StatCard title="Today's Subs" value={overview?.submissionsToday || 0} icon="📝" color="warning" />
          <StatCard title="Missing Today" value={overview?.missingToday || 0} icon="⚠️" color="danger" />
          <StatCard title="Avg Score" value={overview?.avgAiScore || 0} icon="🏆" color="purple" />
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
                  <Bar dataKey="submissions" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-[32px] p-8">
            <h3 className="font-display font-bold text-xl mb-6 text-[var(--text-primary)] flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent" /> Today's Completion Status</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: tooltipBg, backdropFilter: 'blur(12px)', border: `1px solid ${tooltipBorder}`, borderRadius: '16px', color: tooltipText }} itemStyle={{ color: tooltipText }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ActivityFeed activities={notifications || []} />
          <MissingAlert students={missing || []} />
          <Leaderboard data={leaderboard?.slice(0, 5) || []} title="Top 5 Students" />
        </div>
      </div>
    </PageTransition>
  )
}
export default AdminDashboard
