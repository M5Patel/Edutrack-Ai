import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'

const FeedbackModal = ({ isOpen, onClose, submission, onSubmit }) => {
  const [remarks, setRemarks] = useState('')
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('reviewed')

  const handleSubmit = async () => {
    if (!remarks.trim()) return toast.error('Please write remarks')
    setLoading(true)
    try {
      await onSubmit({ remarks, rating, status })
      toast.success('Feedback submitted!')
      onClose()
    } catch { toast.error('Failed to submit') }
    finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Feedback" size="lg">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">Rating</label>
          <div className="flex gap-1">{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)}><Star size={24} className={n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--text-muted)]'} /></button>)}</div>
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="input-field">
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="needs_improvement">Needs Improvement</option>
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Remarks</label>
          </div>
          <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={4} className="input-field resize-none" placeholder="Write your feedback..." />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading}>Submit Feedback</Button>
        </div>
      </div>
    </Modal>
  )
}
export default FeedbackModal
