import api from './api'

export const streamService = {
  getAll: () => api.get('/streams'),
  create: (data) => api.post('/streams', data),
  getById: (id) => api.get(`/streams/${id}`),
  update: (id, data) => api.put(`/streams/${id}`, data),
  delete: (id) => api.delete(`/streams/${id}`),
  assignFaculty: (id, facultyId) => api.post(`/streams/${id}/assign-faculty`, { facultyId })
}
