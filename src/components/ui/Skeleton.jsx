const Skeleton = ({ className = '', count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`skeleton ${className}`} />
    ))}
  </>
)
export const SkeletonCard = () => (
  <div className="bg-surface-2 border border-[var(--border)] rounded-2xl p-6 space-y-4">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-20 w-full" />
  </div>
)
export default Skeleton
