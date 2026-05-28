import { forwardRef } from 'react'

const Button = forwardRef(({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }, ref) => {
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25 hover:shadow-primary/40',
    secondary: 'bg-surface-3 hover:bg-surface-2 text-[var(--text-primary)] border border-[var(--border)]',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25',
    ghost: 'hover:bg-surface-3 text-[var(--text-secondary)]',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10'
  }
  const sizes = { sm: 'py-1.5 px-3 text-xs', md: 'py-2.5 px-5 text-sm', lg: 'py-3 px-6 text-base' }

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
})

Button.displayName = 'Button'
export default Button
