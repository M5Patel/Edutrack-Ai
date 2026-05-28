import Card from '../ui/Card'
import RatingStars from './RatingStars'
import { formatDate } from '../../utils/helpers'

const FeedbackCard = ({ feedback }) => (
  <Card className="border-l-4 border-l-primary">
    <div className="flex items-start justify-between mb-2">
      <p className="text-sm font-medium text-[var(--text-primary)]">{feedback.faculty?.name || 'Faculty'}</p>
      <RatingStars rating={feedback.rating || 0} />
    </div>
    <p className="text-sm text-[var(--text-secondary)] mb-2">{feedback.remarks}</p>
    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
      <span>{formatDate(feedback.createdAt)}</span>
      {feedback.usedAISuggestion && <span className="text-primary">✨ AI-assisted</span>}
    </div>
  </Card>
)
export default FeedbackCard
