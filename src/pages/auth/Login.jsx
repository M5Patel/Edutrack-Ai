import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, Zap } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters')
})

const PORTAL_CONFIGS = {
  student: {
    role: 'student',
    title: 'Student Portal',
    subtitle: 'Access your learning dashboard and submit daily assignments',
    emailPlaceholder: 'student1@edutrack.com',
    gradient: 'from-violet-500/20 to-indigo-600/5',
    btnGradient: 'bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700',
    shadow: 'shadow-violet-500/30',
    accentColor: 'text-violet-400'
  },
  faculty: {
    role: 'faculty',
    title: 'Faculty Portal',
    subtitle: 'Access reviews, grade assignments, and monitor class progress',
    emailPlaceholder: 'faculty1@edutrack.com',
    gradient: 'from-cyan-500/20 to-blue-600/5',
    btnGradient: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700',
    shadow: 'shadow-cyan-500/30',
    accentColor: 'text-cyan-400'
  },
  admin: {
    role: 'admin',
    title: 'Administrator Portal',
    subtitle: 'Access system controls, manage profiles, and audit log files',
    emailPlaceholder: 'admin@edutrack.com',
    gradient: 'from-emerald-500/20 to-teal-600/5',
    btnGradient: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
    shadow: 'shadow-emerald-500/30',
    accentColor: 'text-emerald-400'
  }
}

const Login = () => {
  const { portalRole } = useParams()
  const config = PORTAL_CONFIGS[portalRole]
  const navigate = useNavigate()

  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuthContext()

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  // Redirect to central selection gate if invalid portal path
  useEffect(() => {
    if (!config) {
      navigate('/login')
    }
  }, [config, navigate])

  if (!config) return null

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await loginUser(data.email, data.password)
      
      // Strict role check: enforce that user database role matches the active portal
      if (user.role !== config.role) {
        // Immediately wipe auth state and sign out Supabase session
        useAuthStore.getState().clearAuth()
        await supabase.auth.signOut()
        
        throw new Error(`Access denied: This login portal is restricted to ${config.title} accounts.`)
      }

      const routes = { admin: '/admin/dashboard', faculty: '/faculty/dashboard', student: '/student/dashboard' }
      navigate(routes[user.role] || '/student/dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--bg-body)' }}>
      <div className="bg-mesh"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-6xl mx-auto p-4 flex gap-8 z-10"
      >
        {/* Left - Hero/Branding */}
        <div className="hidden lg:flex flex-col justify-center w-1/2 p-12 glass-panel rounded-[32px]">
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8 font-display font-medium text-sm">
              <Sparkles size={16} /> Secure Gateway Enabled
            </div>
            <h1 className="text-6xl font-display font-bold text-[var(--text-primary)] leading-tight mb-6">
              Track Your <br /> 
              <span className="gradient-text">Brilliance.</span>
            </h1>
            <p className="text-xl text-[var(--text-muted)] mb-12 font-light leading-relaxed">
              EduTrack seamlessly syncs your academic records with clean progression and visual analytics.
            </p>
            
            <div className="space-y-6">
              {[
                { title: 'Secure Authentication', desc: 'Protected by Supabase database access tokens.', icon: Zap },
                { title: 'Visual Analytics', desc: 'Monitor your activity heatmaps and badge progress.', icon: Sparkles }
              ].map((f, i) => {
                const Icon = f.icon
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.15 }} className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20 shrink-0">
                       <Icon size={20} className={config.accentColor} />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-semibold text-[var(--text-primary)]">{f.title}</h3>
                      <p className="text-[var(--text-muted)] text-sm mt-1">{f.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
 
        {/* Right - Form Content */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-md glass-panel rounded-[32px] p-10 shadow-2xl relative">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -z-10 translate-x-10 -translate-y-10`}></div>
            
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-2">{config.title}</h2>
              <p className="text-[var(--text-muted)] font-light text-sm">{config.subtitle}</p>
            </div>
 
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] z-10" size={20} />
                  <input 
                    type="email" 
                    className={`glass-input pl-12 ${errors.email ? 'border-red-500/50 focus:border-red-500' : ''}`}
                    placeholder={config.emailPlaceholder} 
                    {...register('email')} 
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-2 ml-1">{errors.email.message}</p>}
              </div>
 
              <div className="relative">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] z-10" size={20} />
                  <input 
                    type={showPwd ? 'text' : 'password'} 
                    className={`glass-input pl-12 pr-12 ${errors.password ? 'border-red-500/50 focus:border-red-500' : ''}`}
                    placeholder="••••••••" 
                    {...register('password')} 
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                    {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-2 ml-1">{errors.password.message}</p>}
              </div>
 
              <button type="submit" disabled={loading} className={`relative overflow-hidden ${config.btnGradient} text-white font-display font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-md ${config.shadow} active:scale-95 w-full mt-4 flex items-center justify-center gap-2 group disabled:opacity-50`}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn size={20} className="group-hover:translate-x-1 transition-transform" /> Sign In
                  </>
                )}
              </button>
            </form>
            <div className="mt-8 text-center">
              <Link to="/login" className="text-sm text-primary hover:underline font-medium">← Back to Portal Selection</Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
