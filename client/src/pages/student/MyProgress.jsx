import { useQuery } from '@tanstack/react-query'
import useAuthStore from '../../store/authStore'
import { studentService } from '../../services/studentService'
import PageTransition from '../../components/shared/PageTransition'
import SubmissionHeatmap from '../../components/dashboard/SubmissionHeatmap'
import StreakCounter from '../../components/shared/StreakCounter'
import Card from '../../components/ui/Card'
import { SkeletonCard } from '../../components/ui/Skeleton'

const MyProgress = () => {
  const { profile } = useAuthStore()

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['my-progress', profile?._id],
    queryFn: async () => { if (!profile?._id) return null; const { data } = await studentService.getAnalytics(profile._id); return data.data },
    enabled: !!profile?._id
  })

  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">My Progress</h1></div>
          <StreakCounter streak={profile?.currentStreak || 0} />
        </div>

        <SubmissionHeatmap data={analytics?.dailyData || {}} />

        {/* Progress details are tracked in the submissions feed and streak metrics */}

        {profile?.badges?.length > 0 && (
          <Card>
            <h3 className="font-display font-bold mb-3 text-[var(--text-primary)]">Badges ({profile.badges.length})</h3>
            <div className="flex flex-wrap gap-3">{profile.badges.map((b, i) => <div key={i} className="bg-surface-3 rounded-xl px-4 py-2 flex items-center gap-2"><span className="text-xl">{b.icon}</span><span className="text-sm font-medium">{b.name}</span></div>)}</div>
          </Card>
        )}
      </div>
    </PageTransition>
  )
}
export default MyProgress
