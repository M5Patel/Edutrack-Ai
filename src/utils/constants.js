export const ROLES = { ADMIN: 'admin', FACULTY: 'faculty', STUDENT: 'student' }

export const SUBMISSION_STATUSES = {
  submitted: { label: 'Submitted', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  reviewed: { label: 'Reviewed', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  approved: { label: 'Approved', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  needs_improvement: { label: 'Needs Improvement', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  late: { label: 'Late', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
}

export const STREAM_COLORS = {
  'Data Science': '#6366F1',
  'Web Development': '#22D3EE',
  'UI/UX': '#F59E0B',
  'Digital Marketing': '#10B981',
  'Video Editing': '#EF4444'
}

export const STREAM_ICONS = {
  'Data Science': '📊',
  'Web Development': '🌐',
  'UI/UX': '🎨',
  'Digital Marketing': '📱',
  'Video Editing': '🎬'
}

export const NAV_ITEMS = {
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
    { label: 'Students', path: '/admin/students', icon: 'Users' },
    { label: 'Faculty', path: '/admin/faculty', icon: 'GraduationCap' },
    { label: 'Streams', path: '/admin/streams', icon: 'BookOpen' },
    { label: 'Audit Log', path: '/admin/audit', icon: 'FileText' },
    { label: 'Settings', path: '/admin/settings', icon: 'Settings' }
  ],
  faculty: [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: 'LayoutDashboard' },
    { label: 'Review', path: '/faculty/review', icon: 'ClipboardCheck' },
    { label: 'Analytics', path: '/faculty/analytics', icon: 'BarChart3' },
    { label: 'Reports', path: '/faculty/reports', icon: 'FileBarChart' }
  ],
  student: [
    { label: 'Dashboard', path: '/student/dashboard', icon: 'LayoutDashboard' },
    { label: 'Submit', path: '/student/submit', icon: 'Upload' },
    { label: 'My Work', path: '/student/submissions', icon: 'FolderOpen' },
    { label: 'Progress', path: '/student/progress', icon: 'TrendingUp' }
  ]
}
