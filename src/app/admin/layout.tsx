import { type ReactNode } from 'react'
import AdminSidebar from '@/components/dashboard/AdminSidebar'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div style={{ flex: 1, overflow: 'auto', paddingTop: 0 }}>
        {children}
      </div>
      <style>{`
        @media (max-width: 900px) {
          div:first-child {
            flex-direction: column;
          }
          div:last-child {
            padding-top: 60px;
          }
        }
      `}</style>
    </div>
  )
}
