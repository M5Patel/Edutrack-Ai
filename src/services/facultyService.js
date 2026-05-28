import api from './api'

export const facultyService = {
  getAll: (params) => api.get('/faculty', { params }),
  create: (data) => api.post('/faculty', data),
  getById: (id) => api.get(`/faculty/${id}`),
  update: (id, data) => api.put(`/faculty/${id}`, data),
  delete: (id) => api.delete(`/faculty/${id}`)
}

export const feedbackService = {
  add: (submissionId, data) => api.post(`/feedback/${submissionId}`, data),
  get: (submissionId) => api.get(`/feedback/${submissionId}`),
  update: (id, data) => api.put(`/feedback/${id}`, data),
  delete: (id) => api.delete(`/feedback/${id}`)
}
