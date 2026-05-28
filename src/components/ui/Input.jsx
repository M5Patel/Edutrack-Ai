import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>}
    <div className="relative">
      {Icon && <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />}
      <input ref={ref} className={`input-field ${Icon ? 'pl-11' : ''} ${error ? 'border-red-500 focus:ring-red-500/50' : ''} ${className}`} {...props} />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
))
Input.displayName = 'Input'
export default Input
