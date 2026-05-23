import Card from '../ui/Card'

const SubmissionHeatmap = ({ data = {} }) => {
  const days = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push({ date: key, count: data[key] || 0, day: d.getDay() })
  }

  const getColor = (count) => {
    if (count === 0) return 'bg-surface-3'
    if (count === 1) return 'bg-emerald-500/30'
    if (count === 2) return 'bg-emerald-500/50'
    if (count >= 3) return 'bg-emerald-500/80'
    return 'bg-emerald-500'
  }

  return (
    <Card>
      <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-4">Submission Heatmap</h3>
      <div className="flex flex-wrap gap-1">
        {days.map((d, i) => (
          <div key={i} className={`w-3.5 h-3.5 rounded-sm ${getColor(d.count)} transition-colors`} title={`${d.date}: ${d.count} submissions`} />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-[var(--text-muted)]">Less</span>
        {[0, 1, 2, 3].map(n => <div key={n} className={`w-3 h-3 rounded-sm ${getColor(n)}`} />)}
        <span className="text-xs text-[var(--text-muted)]">More</span>
      </div>
    </Card>
  )
}
export default SubmissionHeatmap
