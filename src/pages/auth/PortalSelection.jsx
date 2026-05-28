import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, Sparkles } from 'lucide-react'
import Card from '../../components/ui/Card'

const PORTALS = [
  {
    role: 'student',
    title: 'Student Portal',
    desc: 'Submit daily assignments, track your streaks, and view achievements.',
    icon: GraduationCap,
    gradient: 'from-violet-500 to-indigo-600',
    shadow: 'shadow-violet-500/10',
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/5'
  },
  {
    role: 'faculty',
    title: 'Faculty Portal',
    desc: 'Review submissions, evaluate student work, and manage analytics.',
    icon: BookOpen,
    gradient: 'from-cyan-500 to-blue-600',
    shadow: 'shadow-cyan-500/10',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/5'
  }
]

const PortalSelection = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--bg-body)' }}>
      <div className="bg-mesh"></div>

      <div className="max-w-5xl w-full space-y-12 z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            onClick={() => navigate('/adminlogin')}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-display font-medium cursor-pointer hover:bg-primary/20 transition-all select-none"
          >
            <Sparkles size={14} /> Academic Gateways
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-display font-bold text-[var(--text-primary)]"
          >
            Welcome to <span className="gradient-text">EduTrack</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[var(--text-secondary)] font-light text-lg max-w-xl mx-auto"
          >
            Select your portal below to access your role-specific dashboard and tools.
          </motion.p>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {PORTALS.map((portal, i) => {
            const Icon = portal.icon
            return (
              <motion.div
                key={portal.role}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card
                  hover
                  onClick={() => navigate(`/login/${portal.role}`)}
                  className={`cursor-pointer h-full border ${portal.border} ${portal.bg} ${portal.shadow} transition-all duration-300 flex flex-col justify-between p-8`}
                >
                  <div className="space-y-6">
                    {/* Icon wrapper */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center text-white shadow-lg`}>
                      <Icon size={28} />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-display font-bold text-[var(--text-primary)]">
                        {portal.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">
                        {portal.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-primary group">
                    Enter Portal
                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PortalSelection
