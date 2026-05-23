import { useQuery } from '@tanstack/react-query'
import useAuthStore from '../../store/authStore'
import { studentService } from '../../services/studentService'
import PageTransition from '../../components/shared/PageTransition'
import SubmissionCard from '../../components/submissions/SubmissionCard'
import EmptyState from '../../components/shared/EmptyState'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { useState } from 'react'

const MySubmissions = () => {
  const { profile } = useAuthStore()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['my-submissions', profile?._id, page],
    queryFn: async () => { if (!profile?._id) return null; const { data } = await studentService.getSubmissions(profile._id, { page, limit: 12 }); return data },
    enabled: !!profile?._id
  })

  return (
    <PageTransition>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">My Submissions</h1><p className="text-[var(--text-muted)] text-sm">{data?.total || 0} total submissions</p></div>
        {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div> : !data?.data?.length ? <EmptyState title="No submissions yet" description="Start by submitting your daily work!" /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map(s => <SubmissionCard key={s._id} submission={s} />)}
          </div>
        )}
        {data?.pages > 1 && <div className="flex justify-center gap-2">{Array.from({ length: data.pages }).map((_, i) => <button key={i} onClick={() => setPage(i+1)} className={`w-9 h-9 rounded-xl text-sm font-medium ${page === i+1 ? 'bg-primary text-white' : 'bg-surface-3 text-[var(--text-secondary)]'}`}>{i+1}</button>)}</div>}
      </div>
    </PageTransition>
  )
}
export default MySubmissions
