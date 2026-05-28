import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { streamService } from '../../services/streamService'
import PageTransition from '../../components/shared/PageTransition'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react'
import { STREAM_ICONS } from '../../utils/constants'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const ManageStreams = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', description: '', color: '#6366F1', icon: '📚' })
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['streams'],
    queryFn: async () => { const { data } = await streamService.getAll(); return data.data }
  })

  const createMutation = useMutation({
    mutationFn: (d) => streamService.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['streams'] }); toast.success('Stream created!'); closeModal() },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create stream')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => streamService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['streams'] }); toast.success('Stream updated!'); closeModal() },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update stream')
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => streamService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['streams'] }); toast.success('Stream deleted!'); setDeleteOpen(false); setEditing(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete stream')
  })

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm({ name: '', code: '', description: '', color: '#6366F1', icon: '📚' }) }
  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', description: '', color: '#6366F1', icon: '📚' }); setModalOpen(true) }
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name || '', code: s.code || '', description: s.description || '', color: s.color || '#6366F1', icon: s.icon || '📚' }); setModalOpen(true) }
  const openDelete = (s) => { setEditing(s); setDeleteOpen(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editing) {
      updateMutation.mutate({ id: editing._id || editing.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs mb-2 font-display">
              <BookOpen size={14} /> Configuration
            </div>
            <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">Manage Streams</h1>
            <p className="text-[var(--text-muted)] text-sm">{data?.length || 0} academic streams</p>
          </div>
          <Button onClick={openCreate} size="sm"><Plus size={16} /> Add Stream</Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data || []).map((s, idx) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={s._id || s.id}>
                <Card hover className="border-l-4 relative group" style={{ borderLeftColor: s.color }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{STREAM_ICONS[s.name] || s.icon || '📚'}</div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => openDelete(s)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-1">{s.name}</h3>
                  <p className="text-xs font-mono text-[var(--text-muted)] mb-2">{s.code}</p>
                  <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{s.description || 'No description'}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                    <span className="text-xs text-[var(--text-muted)]">{s.faculty?.length || 0} faculty</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Stream' : 'Add New Stream'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Stream Name *</label>
            <input className="glass-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Computer Science" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Code *</label>
              <input className="glass-input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required placeholder="CS" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                <input className="glass-input" value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="#6366F1" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Icon Emoji</label>
            <input className="glass-input" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder="📚" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
            <textarea className="glass-input resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description of this stream..." />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" loading={createMutation.isPending || updateMutation.isPending}>{editing ? 'Update Stream' : 'Create Stream'}</Button>
            <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteOpen} onClose={() => { setDeleteOpen(false); setEditing(null) }} title="Delete Stream" size="sm">
        <p className="text-[var(--text-secondary)] mb-6">Permanently delete <strong className="text-[var(--text-primary)]">{editing?.name}</strong>? Students and faculty assigned to it will be unlinked.</p>
        <div className="flex gap-3">
          <button onClick={() => deleteMutation.mutate(editing._id || editing.id)} disabled={deleteMutation.isPending} className="btn-danger flex-1">{deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}</button>
          <button onClick={() => { setDeleteOpen(false); setEditing(null) }} className="btn-secondary flex-1">Cancel</button>
        </div>
      </Modal>
    </PageTransition>
  )
}
export default ManageStreams
