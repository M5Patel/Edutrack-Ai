import React from 'react'
import { useQuery } from '@tanstack/react-query'

// ==========================================
// 1. UTILITIES & MOCK API
// ==========================================

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString))
}

// Mocking your api.get('/audit?limit=50')
const api = {
  get: async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200))
    return {
      data: {
        data: [
          { id: 1, user: { name: 'Alice Smith' }, action: 'User_Login', entity: 'Authentication', createdAt: new Date().toISOString(), ipAddress: '192.168.1.104' },
          { id: 2, user: { name: 'System' }, action: 'Backup_Start', entity: 'Database', createdAt: new Date(Date.now() - 3600000).toISOString(), ipAddress: '10.0.0.1' },
          { id: 3, user: { name: 'Bob Jones' }, action: 'Record_Update', entity: 'Billing Profile', createdAt: new Date(Date.now() - 7200000).toISOString(), ipAddress: '172.16.254.1' },
          { id: 4, user: null, action: 'Password_Reset', entity: 'Authentication', createdAt: new Date(Date.now() - 86400000).toISOString(), ipAddress: '198.51.100.14' },
        ]
      }
    }
  }
}

// ==========================================
// 2. INLINE COMPONENTS
// ==========================================

const PageTransition = ({ children }) => (
  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out w-full">
    {children}
  </div>
)

const SkeletonCard = () => (
  <div className="w-full border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-4 shadow-sm bg-white dark:bg-gray-900">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
      </div>
    ))}
  </div>
)

const Table = ({ columns, data }) => (
  <div className="w-full overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm bg-white dark:bg-gray-900">
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
          <tr>
            {columns.map((col, i) => (
              <th key={i} scope="col" className="px-6 py-4 font-medium tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                No audit logs found.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/25 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

const AuditLog = () => {
  const { data, isLoading } = useQuery({ 
    queryKey: ['audit'], 
    queryFn: async () => { 
      const { data } = await api.get('/audit?limit=50')
      return data.data 
    } 
  })
  
  const columns = [
    { 
      header: 'User', 
      render: (r) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {r.user?.name || 'System'}
        </span>
      ) 
    },
    { 
      header: 'Action', 
      render: (r) => (
        <span className="inline-flex items-center font-mono text-[11px] font-semibold tracking-wider text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 uppercase">
          {r.action}
        </span>
      ) 
    },
    { header: 'Entity', render: (r) => r.entity || '-' },
    { header: 'Date', render: (r) => formatDate(r.createdAt) },
    { 
      header: 'IP', 
      render: (r) => (
        <span className="text-gray-500 dark:text-gray-400 font-mono text-sm">
          {r.ipAddress || '-'}
        </span>
      ) 
    }
  ]
  
  return (
    <PageTransition>
      <div className="space-y-6 sm:space-y-8 w-full p-4 sm:p-6 md:p-8">
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-gray-900 dark:text-gray-50 drop-shadow-sm">
            Audit Log
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track and monitor system-wide activities and security events.
          </p>
        </div>
        
        {isLoading ? <SkeletonCard /> : <Table columns={columns} data={data || []} />}
      </div>
    </PageTransition>
  )
}

export default AuditLog