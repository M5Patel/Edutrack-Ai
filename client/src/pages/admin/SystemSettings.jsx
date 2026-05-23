import PageTransition from '../../components/shared/PageTransition'
import Card from '../../components/ui/Card'
import ThemeToggle from '../../components/layout/ThemeToggle'
import { Settings as SettingsIcon } from 'lucide-react'

const SystemSettings = () => (
  <PageTransition>
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">System Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-display font-bold mb-4 flex items-center gap-2"><SettingsIcon size={18} /> Appearance</h3>
          <div className="flex items-center justify-between"><span className="text-sm text-[var(--text-secondary)]">Theme</span><ThemeToggle /></div>
        </Card>
        <Card>
          <h3 className="font-display font-bold mb-4">Application Info</h3>
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>API:</strong> /api/health</p>
            <p><strong>Environment:</strong> Development</p>
          </div>
        </Card>
      </div>
    </div>
  </PageTransition>
)
export default SystemSettings
