const Card = ({ children, className = '', hover = false, padding = true, ...props }) => (
  <div className={`glass-card ${padding ? 'p-6' : ''} ${hover ? 'hover:-translate-y-1' : ''} ${className}`} {...props}>
    {children}
  </div>
)

export const CardHeader = ({ children, className = '' }) => <div className={`mb-4 ${className}`}>{children}</div>
export const CardTitle = ({ children, className = '' }) => <h3 className={`font-display font-bold text-lg text-[var(--text-primary)] ${className}`}>{children}</h3>
export const CardDescription = ({ children, className = '' }) => <p className={`text-sm text-[var(--text-muted)] mt-1 ${className}`}>{children}</p>
export const CardContent = ({ children, className = '' }) => <div className={className}>{children}</div>

export default Card
