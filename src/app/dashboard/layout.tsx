import { type ReactNode } from 'react'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <DashboardSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', paddingTop: 0 }}>
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
