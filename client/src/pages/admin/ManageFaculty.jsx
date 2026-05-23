import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { facultyService } from '../../services/facultyService'
import PageTransition from '../../components/shared/PageTransition'
import Table from '../../components/ui/Table'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { Plus, Edit2, Trash2, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'

const ManageFaculty = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', phone: '' })
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['faculty'],
    queryFn: async () => { const { data } = await facultyService.getAll({}); return data }
  })

  const createMutation = useMutation({
    mutationFn: (d) => facultyService.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['faculty'] }); toast.success('Faculty created!'); closeModal() },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create faculty')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => facultyService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['faculty'] }); toast.success('Faculty updated!'); closeModal() },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update faculty')
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => facultyService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['faculty'] }); toast.success('Faculty deactivated!'); setDeleteOpen(false); setEditing(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete faculty')
  })

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm({ name: '', email: '', password: '', department: '', phone: '' }) }
  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', password: '', department: '', phone: '' }); setModalOpen(true) }
  const openEdit = (r) => { setEditing(r); setForm({ name: r.userId?.name || '', email: r.userId?.email || '', password: '', department: r.department || '', phone: r.phone || '' }); setModalOpen(true) }
  const openDelete = (r) => { setEditing(r); setDeleteOpen(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editing) {
      updateMutation.mutate({ id: editing._id, data: form })
    } else {
      if (!form.password) { toast.error('Password is required'); return }
      createMutation.mutate(form)
    }
  }

  const columns = [
    { header: 'Faculty', render: (r) => <div className="flex items-center gap-3"><Avatar name={r.userId?.name} size="sm" /><div><p className="font-medium text-[var(--text-primary)]">{r.userId?.name}</p><p className="text-xs text-[var(--text-muted)]">{r.userId?.email}</p></div></div> },
    { header: 'Department', render: (r) => <span className="text-[var(--text-secondary)]">{r.department || 'N/A'}</span> },
    { header: 'Streams', render: (r) => <div className="flex flex-wrap gap-1">{r.streams?.map((s, i) => <span key={i} className="px-2 py-0.5 bg-primary/10 rounded-full text-xs text-primary font-medium">{s.name}</span>) || <span className="text-[var(--text-muted)] italic text-xs">None</span>}</div> },
    { header: 'Reviewed', render: (r) => <span className="font-bold text-emerald-500">{r.totalReviewed || 0}</span> },
    { header: 'Status', render: (r) => <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.userId?.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{r.userId?.isActive ? 'Active' : 'Inactive'}</span> },
    { header: 'Actions', render: (r) => (
      <div className="flex gap-2">
        <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Edit2 size={16} /></button>
        <button onClick={(e) => { e.stopPropagation(); openDelete(r) }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"><Trash2 size={16} /></button>
      </div>
    )}
  ]

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs mb-2 font-display">
              <GraduationCap size={14} /> Admin
            </div>
            <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">Manage Faculty</h1>
            <p className="text-[var(--text-muted)] text-sm">{data?.total || (data?.data?.length || 0)} faculty members</p>
          </div>
          <Button onClick={openCreate} size="sm"><Plus size={16} /> Add Faculty</Button>
        </div>

        <div className="glass-card rounded-2xl p-1">
          {isLoading ? <div className="p-6"><SkeletonCard /></div> : <Table columns={columns} data={data?.data || []} />}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Faculty' : 'Add New Faculty'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name *</label>
            <input className="glass-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Dr. Jane Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email *</label>
            <input className="glass-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="faculty@edutrack.com" />
          </div>
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password *</label>
              <input className="glass-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="Min 6 characters" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Department</label>
              <input className="glass-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="Computer Science" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phone</label>
              <input className="glass-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 ..." />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" loading={createMutation.isPending || updateMutation.isPending}>{editing ? 'Update Faculty' : 'Create Faculty'}</Button>
            <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteOpen} onClose={() => { setDeleteOpen(false); setEditing(null) }} title="Confirm Deactivation" size="sm">
        <p className="text-[var(--text-secondary)] mb-6">Deactivate <strong className="text-[var(--text-primary)]">{editing?.userId?.name}</strong>? They will lose login access.</p>
        <div className="flex gap-3">
          <button onClick={() => deleteMutation.mutate(editing._id)} disabled={deleteMutation.isPending} className="btn-danger flex-1">{deleteMutation.isPending ? 'Processing...' : 'Yes, Deactivate'}</button>
          <button onClick={() => { setDeleteOpen(false); setEditing(null) }} className="btn-secondary flex-1">Cancel</button>
        </div>
      </Modal>
    </PageTransition>
  )
}
export default ManageFaculty
