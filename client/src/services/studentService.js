import api from './api'

export const studentService = {
  getAll: (params) => api.get('/students', { params }),
  create: (data) => api.post('/students', data),
  getById: (id) => api.get(`/students/${id}`),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getSubmissions: (id, params) => api.get(`/students/${id}/submissions`, { params }),
  getAnalytics: (id) => api.get(`/students/${id}/analytics`),
  getLeaderboard: (params) => api.get('/students/leaderboard', { params })
}
