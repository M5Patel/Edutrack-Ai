import api from './api'

export const analyticsService = {
  getOverview: () => api.get('/analytics/overview'),
  getStreams: () => api.get('/analytics/streams'),
  getStream: (id) => api.get(`/analytics/stream/${id}`),
  getStudent: (id) => api.get(`/analytics/student/${id}`),
  getDaily: () => api.get('/analytics/daily'),
  getWeekly: () => api.get('/analytics/weekly'),
  getReport: (params) => api.get('/analytics/report', { params }),
  export: (params) => api.get('/analytics/export', { params })
}
