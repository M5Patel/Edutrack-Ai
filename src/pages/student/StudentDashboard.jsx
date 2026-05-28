import { useQuery } from '@tanstack/react-query'
import useAuthStore from '../../store/authStore'
import { studentService } from '../../services/studentService'
import { submissionService } from '../../services/submissionService'
import StatCard from '../../components/dashboard/StatCard'
import StreakCounter from '../../components/shared/StreakCounter'
import PageTransition from '../../components/shared/PageTransition'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { Upload, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import useTheme from '../../hooks/useTheme'

const StudentDashboard = () => {
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const axisColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'
  const tickColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)'
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const tooltipText = isDark ? '#fff' : '#0F172A'

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['student-analytics', profile?._id || user?.id],
    queryFn: async () => { 
      const id = profile?._id || user?.id
      if (!id) return null; 
      const { data } = await studentService.getAnalytics(id); 
      return data.data 
    },
    enabled: !!(profile?._id || user?.id)
  })

  const { data: todaySubs } = useQuery({
    queryKey: ['today-subs'],
    queryFn: async () => { const { data } = await submissionService.getToday(); return data.data }
  })

  const submittedToday = todaySubs?.some(s => s.student?._id === profile?._id || s.student?.userId?._id === user?.id)

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>

  const weeklyData = Object.entries(analytics?.dailyData || {}).map(([date, count]) => ({ date: date.slice(5), submissions: count }))
  const scoreTrend = analytics?.scoreTrend || []

  return (
    <PageTransition>
      <div className="space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-[32px] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10 translate-x-32 -translate-y-32"></div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs mb-3 font-display">
              <Sparkles size={14} /> Student Portal
            </div>
            <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-2">Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}!</span></h1>
            <p className="text-[var(--text-muted)] font-light">Here's an overview of your academic progress.</p>
          </div>
          <StreakCounter streak={profile?.currentStreak || profile?.current_streak || 0} />
        </div>

        {/* Today's Action */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className={`p-1 rounded-[32px] bg-gradient-to-r ${submittedToday ? 'from-emerald-500/20 to-emerald-500/5' : 'from-red-500/20 to-red-500/5'}`}>
            <Card className="border-none !p-6 sm:!p-8 rounded-[28px]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${submittedToday ? 'bg-emerald-500/20 shadow-emerald-500/20' : 'bg-red-500/20 shadow-red-500/20'}`}>
                    {submittedToday ? <CheckCircle size={32} className="text-emerald-400" /> : <XCircle size={32} className="text-red-400" />}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-1">{submittedToday ? 'Daily Goal Achieved! 🎉' : 'Action Required ⚠️'}</h3>
                    <p className="text-[var(--text-muted)]">{submittedToday ? 'You have submitted your daily work. Great job keeping your streak alive!' : 'You have not submitted your daily work yet. Don\'t break your streak!'}</p>
                  </div>
                </div>
                {!submittedToday && (
                  <Button onClick={() => navigate('/student/submit')} className="btn-primary whitespace-nowrap px-8 py-4">
                    <Upload size={18} className="mr-2 inline" /> Submit Work
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard title="Total Submissions" value={analytics?.stats?.totalSubmissions || 0} icon="📝" color="primary" />
          <StatCard title="Current Streak" value={analytics?.stats?.currentStreak || 0} icon="🔥" color="accent" />
          <StatCard title="Approved" value={analytics?.stats?.approvedCount || 0} icon="✅" color="success" />
          <StatCard title="Longest Streak" value={analytics?.stats?.longestStreak || 0} icon="🔥" color="warning" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-8">
          <Card className="rounded-[32px] p-8">
            <h3 className="font-display font-bold text-xl mb-6 text-[var(--text-primary)] flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Submission Activity</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke={axisColor} fontSize={12} tick={{fill: tickColor}} />
                  <YAxis stroke={axisColor} fontSize={12} tick={{fill: tickColor}} />
                  <Tooltip contentStyle={{ background: tooltipBg, backdropFilter: 'blur(12px)', border: `1px solid ${tooltipBorder}`, borderRadius: '16px', color: tooltipText }} itemStyle={{ color: tooltipText }} />
                  <Area type="monotone" dataKey="submissions" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorSub)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Badges Section */}
        {profile?.badges?.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Card className="rounded-[32px] p-8">
              <h3 className="font-display font-bold text-xl mb-6 text-[var(--text-primary)] flex items-center gap-2"><Sparkles size={20} className="text-yellow-400" /> Achievement Badges</h3>
              <div className="flex flex-wrap gap-4">
                {profile.badges.map((b, i) => (
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -5 }}
                    key={i} 
                    className="flex items-center gap-3 glass-card shadow-xl rounded-2xl px-5 py-3 group cursor-default"
                  >
                    <span className="text-3xl drop-shadow-md group-hover:scale-125 transition-transform">{b.icon}</span>
                    <span className="text-sm font-display font-bold text-[var(--text-primary)]">{b.name}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}

export default StudentDashboard
