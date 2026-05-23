import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { ShieldX, Home } from 'lucide-react'

const Unauthorized = () => (
  <div className="min-h-screen bg-surface-1 flex items-center justify-center p-6">
    <div className="text-center">
      <ShieldX size={64} className="text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">Access Denied</h2>
      <p className="text-[var(--text-muted)] mb-8">You don't have permission to access this page.</p>
      <Link to="/"><Button><Home size={16} /> Go Home</Button></Link>
    </div>
  </div>
)
export default Unauthorized
