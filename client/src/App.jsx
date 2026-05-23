import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ErrorBoundary from './components/shared/ErrorBoundary'
import Layout from './components/layout/Layout'
import ProtectedRoute from './utils/roleGuard'

// Auth pages
import PortalSelection from './pages/auth/PortalSelection'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageStudents from './pages/admin/ManageStudents'
import ManageFaculty from './pages/admin/ManageFaculty'
import ManageStreams from './pages/admin/ManageStreams'
import AuditLog from './pages/admin/AuditLog'
import SystemSettings from './pages/admin/SystemSettings'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard'
import SubmitWork from './pages/student/SubmitWork'
import MySubmissions from './pages/student/MySubmissions'
import MyProgress from './pages/student/MyProgress'

// Faculty pages
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import ReviewSubmissions from './pages/faculty/ReviewSubmissions'
import StudentAnalytics from './pages/faculty/StudentAnalytics'
import Reports from './pages/faculty/Reports'

// Shared pages
import NotFound from './pages/shared/NotFound'
import Unauthorized from './pages/shared/Unauthorized'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000 }
  }
})

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <ErrorBoundary>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<PortalSelection />} />
                <Route path="/login/:portalRole" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout /></ProtectedRoute>}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="students" element={<ManageStudents />} />
                  <Route path="faculty" element={<ManageFaculty />} />
                  <Route path="streams" element={<ManageStreams />} />
                  <Route path="audit" element={<AuditLog />} />
                  <Route path="settings" element={<SystemSettings />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Student Routes */}
                <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><Layout /></ProtectedRoute>}>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="submit" element={<SubmitWork />} />
                  <Route path="submissions" element={<MySubmissions />} />
                  <Route path="progress" element={<MyProgress />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Faculty Routes */}
                <Route path="/faculty" element={<ProtectedRoute allowedRoles={['faculty']}><Layout /></ProtectedRoute>}>
                  <Route path="dashboard" element={<FacultyDashboard />} />
                  <Route path="review" element={<ReviewSubmissions />} />
                  <Route path="analytics" element={<StudentAnalytics />} />
                  <Route path="reports" element={<Reports />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Root redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
            <Toaster position="top-right" toastOptions={{
              duration: 4000,
              style: { background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '12px' }
            }} />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
)

export default App
