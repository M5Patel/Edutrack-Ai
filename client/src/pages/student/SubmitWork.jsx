import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { submissionService } from '../../services/submissionService'
import useAuthStore from '../../store/authStore'
import PageTransition from '../../components/shared/PageTransition'
import FileUploadZone from '../../components/submissions/FileUploadZone'
import Card from '../../components/ui/Card'
import { Send, CheckCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const SubmitWork = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState([])
  const [success, setSuccess] = useState(false)
  const { profile } = useAuthStore()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      files.forEach(f => formData.append('files', f))
      return submissionService.create(formData)
    },
    onSuccess: () => {
      setSuccess(true)
      toast.success('Submission uploaded successfully!')
      setTimeout(() => navigate('/student/submissions'), 2000)
    },
    onError: (err) => toast.error(err.response?.data?.message || err.message || 'Upload failed')
  })

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="glass-panel p-8 rounded-[32px] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] -z-10 translate-x-32 -translate-y-32"></div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs mb-3 font-display">
            <Sparkles size={14} /> Submission Portal
          </div>
          <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-2">Submit <span className="gradient-text">Daily Work</span></h1>
          <p className="text-[var(--text-muted)] font-light">Upload your assignments and track your progress.</p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-20 glass-panel rounded-[32px]">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                <CheckCircle size={80} className="text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
              </motion.div>
              <h2 className="font-display font-bold text-3xl text-[var(--text-primary)] mb-3">Submitted! 🎉</h2>
              <p className="text-[var(--text-muted)] text-lg">Redirecting to your submissions...</p>
            </motion.div>
          ) : (
            <motion.div key="form" className="space-y-6">
              <Card className="rounded-[32px] p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Submission Title <span className="text-red-400">*</span></label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      className="glass-input" 
                      placeholder="e.g., React Dashboard Component" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Description</label>
                    <textarea 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      rows={5} 
                      className="glass-input resize-none" 
                      placeholder="Describe what you worked on today, any challenges faced..." 
                    />
                  </div>
                  {profile?.stream && (
                    <div className="flex items-center gap-2 p-4 rounded-2xl glass-card">
                      <span className="text-[var(--text-muted)] text-sm">Assigned Stream:</span>
                      <span className="font-medium text-primary">{profile.stream.name || profile.stream.code || 'Assigned'}</span>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="rounded-[32px] p-8">
                <h3 className="font-display font-bold text-xl mb-4 text-[var(--text-primary)]">Upload Files</h3>
                <FileUploadZone files={files} setFiles={setFiles} />
              </Card>

              <button 
                onClick={() => mutation.mutate()} 
                disabled={!title.trim() || mutation.isPending} 
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                    Submit Assignment
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
export default SubmitWork
