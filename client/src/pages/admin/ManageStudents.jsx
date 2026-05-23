import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentService } from '../../services/studentService'
import { streamService } from '../../services/streamService'
import PageTransition from '../../components/shared/PageTransition'
import SearchBar from '../../components/shared/SearchBar'
import Table from '../../components/ui/Table'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { SkeletonCard } from '../../components/ui/Skeleton'
import useDebounce from '../../hooks/useDebounce'
import { Plus, Edit2, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const ManageStudents = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', rollNumber: '', batch: '', phone: '', stream: '' })
  const debSearch = useDebounce(search)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, debSearch],
    queryFn: async () => { const { data } = await studentService.getAll({ page, search: debSearch, limit: 10 }); return data }
  })

  const { data: streams } = useQuery({
    queryKey: ['streams-list'],
    queryFn: async () => { const { data } = await streamService.getAll(); return data.data }
  })

  const createMutation = useMutation({
    mutationFn: (d) => studentService.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['students'] }); toast.success('Student created!'); closeModal() },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create student')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => studentService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['students'] }); toast.success('Student updated!'); closeModal() },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update student')
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => studentService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['students'] }); toast.success('Student deactivated!'); setDeleteOpen(false); setEditing(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete student')
  })

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm({ name: '', email: '', password: '', rollNumber: '', batch: '', phone: '', stream: '' }) }
  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', password: '', rollNumber: '', batch: '', phone: '', stream: '' }); setModalOpen(true) }
  const openEdit = (r) => { setEditing(r); setForm({ name: r.userId?.name || '', email: r.userId?.email || '', password: '', rollNumber: r.rollNumber || '', batch: r.batch || '', phone: r.phone || '', stream: r.streamId || '' }); setModalOpen(true) }
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
    { header: 'Student', render: (r) => <div className="flex items-center gap-3"><Avatar name={r.userId?.name} size="sm" /><div><p className="font-medium text-[var(--text-primary)]">{r.userId?.name}</p><p className="text-xs text-[var(--text-muted)]">{r.userId?.email}</p></div></div> },
    { header: 'Roll No', render: (r) => <span className="font-mono text-[var(--text-secondary)]">{r.rollNumber}</span> },
    { header: 'Stream', render: (r) => <span className="font-medium px-2 py-1 rounded-full text-xs" style={{ color: r.stream?.color, backgroundColor: `${r.stream?.color}15` }}>{r.stream?.name || 'N/A'}</span> },
    { header: 'Batch', render: (r) => <span className="text-[var(--text-secondary)]">{r.batch}</span> },
    { header: 'Streak', render: (r) => <span>🔥 {r.currentStreak}</span> },
    { header: 'Submissions', render: (r) => <span className="font-bold text-primary">{r.totalSubmissions}</span> },
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs mb-2 font-display">
              <Users size={14} /> Admin
            </div>
            <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">Manage Students</h1>
            <p className="text-[var(--text-muted)] text-sm">{data?.total || 0} registered students</p>
          </div>
          <div className="flex gap-3">
            <SearchBar value={search} onChange={setSearch} placeholder="Search students..." />
            <Button onClick={openCreate} size="sm"><Plus size={16} /> Add Student</Button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-1">
          {isLoading ? <div className="p-6"><SkeletonCard /></div> : <Table columns={columns} data={data?.data || []} />}
        </div>

        {data?.pages > 1 && (
          <div className="flex justify-center gap-2">{Array.from({ length: data.pages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary text-white' : 'bg-surface-3 text-[var(--text-secondary)]'}`}>{i + 1}</button>
          ))}</div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Student' : 'Add New Student'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name *</label>
            <input className="glass-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email *</label>
            <input className="glass-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="student@edutrack.com" />
          </div>
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password *</label>
              <input className="glass-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="Min 6 characters" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Roll Number *</label>
              <input className="glass-input" value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} required placeholder="S2024001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Batch *</label>
              <input className="glass-input" value={form.batch} onChange={e => setForm({...form, batch: e.target.value})} required placeholder="2024" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phone</label>
              <input className="glass-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 ..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Stream</label>
              <select className="glass-input" value={form.stream} onChange={e => setForm({...form, stream: e.target.value})}>
                <option value="">Select Stream</option>
                {(streams || []).map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" loading={createMutation.isPending || updateMutation.isPending}>{editing ? 'Update Student' : 'Create Student'}</Button>
            <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteOpen} onClose={() => { setDeleteOpen(false); setEditing(null) }} title="Confirm Deactivation" size="sm">
        <p className="text-[var(--text-secondary)] mb-6">Are you sure you want to deactivate <strong className="text-[var(--text-primary)]">{editing?.userId?.name}</strong>? This will disable their login access.</p>
        <div className="flex gap-3">
          <button onClick={() => deleteMutation.mutate(editing._id)} disabled={deleteMutation.isPending} className="btn-danger flex-1">
            {deleteMutation.isPending ? 'Deactivating...' : 'Yes, Deactivate'}
          </button>
          <button onClick={() => { setDeleteOpen(false); setEditing(null) }} className="btn-secondary flex-1">Cancel</button>
        </div>
      </Modal>
    </PageTransition>
  )
}
export default ManageStudents
