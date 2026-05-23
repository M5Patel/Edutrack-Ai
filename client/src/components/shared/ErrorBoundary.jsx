import { Component } from 'react'
import Button from '../ui/Button'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null } }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
          <div className="text-4xl mb-4">😵</div>
          <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-2">Something went wrong</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <Button onClick={() => { this.setState({ hasError: false }); window.location.reload() }}>Try Again</Button>
        </div>
      )
    }
    return this.props.children
  }
}
export default ErrorBoundary
