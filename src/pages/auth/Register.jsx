import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ThemeToggle from '../../components/layout/ThemeToggle'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
  role: z.enum(['student', 'faculty']),
  rollNumber: z.string().optional(),
  stream: z.string().optional(),
  batch: z.string().optional()
})

const Register = () => {
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { registerUser } = useAuthContext()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { role: 'student' } })
  const role = watch('role')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await registerUser(data)
      const routes = { admin: '/admin/dashboard', faculty: '/faculty/dashboard', student: '/student/dashboard' }
      navigate(routes[user.role] || '/student/dashboard')
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-1 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-display font-bold gradient-text">🎓 EduTrack AI</h1>
          <ThemeToggle />
        </div>
        <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-2">Create Account</h2>
        <p className="text-[var(--text-muted)] mb-8">Join EduTrack AI today</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" icon={User} placeholder="John Doe" error={errors.name?.message} {...register('name')} />
          <Input label="Email" icon={Mail} type="email" placeholder="you@email.com" error={errors.email?.message} {...register('email')} />
          <div className="relative">
            <Input label="Password" icon={Lock} type={showPwd ? 'text' : 'password'} placeholder="••••••••" error={errors.password?.message} {...register('password')} />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-9 text-[var(--text-muted)]">{showPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Role</label>
            <select {...register('role')} className="input-field">
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
          {role === 'student' && (
            <>
              <Input label="Roll Number" placeholder="ET2024001" {...register('rollNumber')} />
              <Input label="Batch" placeholder="2024-25" {...register('batch')} />
            </>
          )}
          <Button type="submit" loading={loading} className="w-full mt-2"><UserPlus size={18} /> Create Account</Button>
        </form>
        <p className="text-center text-sm text-[var(--text-muted)] mt-6">Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link></p>
      </motion.div>
    </div>
  )
}
export default Register
