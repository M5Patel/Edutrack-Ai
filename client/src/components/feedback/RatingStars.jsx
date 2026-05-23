import { Star } from 'lucide-react'
const RatingStars = ({ rating, size = 16 }) => (
  <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} size={size} className={n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--text-muted)]'} />)}</div>
)
export default RatingStars
