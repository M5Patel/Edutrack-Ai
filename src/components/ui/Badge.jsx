const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    danger: 'bg-red-500/10 text-red-500 border-red-500/20',
    info: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
export default Badge
