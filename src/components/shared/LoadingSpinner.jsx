const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizes[size]} border-3 border-[var(--border)] border-t-primary rounded-full animate-spin`} />
    </div>
  )
}
export default LoadingSpinner
