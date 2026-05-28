import axios from 'axios'
import useAuthStore from '../store/authStore'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor: attach Supabase access token
api.interceptors.request.use(async (config) => {
  // First check Zustand store for token
  let token = useAuthStore.getState().accessToken

  // If no token in store, try Supabase session
  if (!token) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      token = session.access_token
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 and refresh via Supabase
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError || !session) throw new Error('Refresh failed')

        const newToken = session.access_token
        useAuthStore.getState().setAuth(
          useAuthStore.getState().user,
          useAuthStore.getState().profile,
          newToken
        )

        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        useAuthStore.getState().clearAuth()
        await supabase.auth.signOut()
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
