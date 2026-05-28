import { createContext, useContext, useEffect, useState } from 'react'
import useAuthStore from '../store/authStore'
import api from '../services/api'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const { setAuth, clearAuth } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session && mounted) {
          await fetchMe(session.access_token)
        } else if (mounted) {
          setLoading(false)
        }
      } catch (err) {
        if (mounted) setLoading(false)
      }
    }
    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        clearAuth()
        window.location.href = '/login'
      } else if (event === 'TOKEN_REFRESHED' && session) {
        useAuthStore.getState().setAuth(
          useAuthStore.getState().user,
          useAuthStore.getState().profile,
          session.access_token
        )
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchMe = async (token) => {
    try {
      if (token) {
        const { data } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setAuth(data.data.user, data.data.profile, token)
      }
    } catch (err) {
      clearAuth()
      await supabase.auth.signOut()
    } finally {
      setLoading(false)
    }
  }

  const loginUser = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const { user, accessToken, refreshToken } = data.data

      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      const { data: meData } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      
      setAuth(meData.data.user, meData.data.profile, accessToken)
      toast.success('Welcome back!')
      return user
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed'
      throw new Error(msg)
    }
  }

  const registerUser = async (formData) => {
    try {
      const { data } = await api.post('/auth/register', formData)
      const { user, accessToken, refreshToken } = data.data

      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      const { data: meData } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      setAuth(meData.data.user, meData.data.profile, accessToken)
      toast.success('Account created!')
      return user
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed'
      throw new Error(msg)
    }
  }

  const logoutUser = async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) { console.error('Backend logout failed', e) }
    
    await supabase.auth.signOut()
    clearAuth()
    toast.success('Logged out successfully')
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ loginUser, registerUser, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
