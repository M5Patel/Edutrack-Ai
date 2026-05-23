import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { submissionService } from '../../services/submissionService'
import { feedbackService } from '../../services/facultyService'
import PageTransition from '../../components/shared/PageTransition'
import SubmissionCard from '../../components/submissions/SubmissionCard'
import SearchBar from '../../components/shared/SearchBar'
import FilterBar from '../../components/shared/FilterBar'
import Modal from '../../components/ui/Modal'
import FeedbackModal from '../../components/feedback/FeedbackModal'
import FilePreview from '../../components/submissions/FilePreview'
import Button from '../../components/ui/Button'
import { SkeletonCard } from '../../components/ui/Skeleton'
import EmptyState from '../../components/shared/EmptyState'
import useDebounce from '../../hooks/useDebounce'
import { ClipboardCheck, FileSearch } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Approved', value: 'approved' },
  { label: 'Needs Improvement', value: 'needs_improvement' }
]

const ReviewSubmissions = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const debSearch = useDebounce(search)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', status, debSearch],
    queryFn: async () => { const { data } = await submissionService.getAll({ status: status || undefined, limit: 50 }); return data.data }
  })

  // Client-side search filtering
  const filtered = useMemo(() => {
    if (!data) return []
    if (!debSearch.trim()) return data
    const q = debSearch.toLowerCase()
    return data.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.student?.userId?.name?.toLowerCase().includes(q) ||
      s.stream?.name?.toLowerCase().includes(q)
    )
  }, [data, debSearch])

  const handleFeedback = async (feedbackData) => {
    await feedbackService.add(selected._id, feedbackData)
    if (feedbackData.status !== 'reviewed') {
      await submissionService.updateStatus(selected._id, feedbackData.status)
    }
    queryClient.invalidateQueries({ queryKey: ['submissions'] })
    setFeedbackOpen(false)
    setSelected(null)
    toast.success('Feedback submitted!')
  }

  const statusCounts = useMemo(() => {
    if (!data) return {}
    return {
      '': data.length,
      submitted: data.filter(s => s.status === 'submitted').length,
      reviewed: data.filter(s => s.status === 'reviewed').length,
      approved: data.filter(s => s.status === 'approved').length,
      needs_improvement: data.filter(s => s.status === 'needs_improvement').length,
    }
  }, [data])

  return (
    <PageTransition>
      <div className="space-y-6">
        
        {/* Page Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-[32px] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/15 rounded-full blur-[80px] -z-10 translate-x-32 -translate-y-32"></div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs mb-3 font-display">
                <ClipboardCheck size={14} /> Faculty
              </div>
              <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">Review Submissions</h1>
              <p className="text-[var(--text-muted)] text-sm mt-1">{data?.length || 0} total submissions · {statusCounts.submitted || 0} awaiting review</p>
            </div>
            
            {/* Search */}
            <SearchBar 
              value={search} 
              onChange={setSearch} 
              placeholder="Search by title, student, stream..." 
              className="lg:max-w-sm"
            />
          </div>
          
          {/* Filter Tabs */}
          <div className="mt-6">
            <FilterBar 
              filters={statusFilters.map(f => ({
                ...f,
                label: `${f.label}${statusCounts[f.value] != null ? ` (${statusCounts[f.value]})` : ''}`
              }))} 
              activeFilter={status} 
              onChange={setStatus} 
            />
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : !filtered?.length ? (
          <EmptyState 
            title={search ? `No results for "${search}"` : "No submissions found"} 
            description={search ? "Try a different search term or clear filters" : "Submissions from students will appear here"}
            icon={<FileSearch size={48} className="text-[var(--text-muted)] opacity-40" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s, idx) => (
              <motion.div 
                key={s._id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              >
                <SubmissionCard submission={s} onClick={(sub) => setSelected(sub)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selected && !feedbackOpen} onClose={() => setSelected(null)} title={selected?.title} size="xl">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">{selected.description}</p>
            {selected.files?.map((f, i) => <FilePreview key={i} file={f} />)}
            <Button onClick={() => setFeedbackOpen(true)} className="w-full">📝 Give Feedback</Button>
          </div>
        )}
      </Modal>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} submission={selected} onSubmit={handleFeedback} />
    </PageTransition>
  )
}
export default ReviewSubmissions
