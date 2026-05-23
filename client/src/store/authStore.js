import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, profile, accessToken) => set({ user, profile, accessToken, isAuthenticated: true }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  clearAuth: () => set({ user: null, profile: null, accessToken: null, isAuthenticated: false })
}))

export default useAuthStore
