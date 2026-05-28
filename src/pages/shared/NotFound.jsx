import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { Home } from 'lucide-react'

const NotFound = () => (
  <div className="min-h-screen bg-surface-1 flex items-center justify-center p-6">
    <div className="text-center">
      <h1 className="text-8xl font-display font-bold gradient-text mb-4">404</h1>
      <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">Page Not Found</h2>
      <p className="text-[var(--text-muted)] mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/"><Button><Home size={16} /> Go Home</Button></Link>
    </div>
  </div>
)
export default NotFound
