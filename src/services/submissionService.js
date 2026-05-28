import api from './api'

export const submissionService = {
  getAll: (params) => api.get('/submissions', { params }),
  create: (formData) => api.post('/submissions', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getById: (id) => api.get(`/submissions/${id}`),
  update: (id, formData) => api.put(`/submissions/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/submissions/${id}`),
  updateStatus: (id, status) => api.put(`/submissions/${id}/status`, { status }),
  getToday: () => api.get('/submissions/today'),
  getMissing: () => api.get('/submissions/missing')
}
