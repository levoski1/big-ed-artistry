import { type ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import AdminSidebar from '@/components/dashboard/AdminSidebar'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/admin')
  if (user.role !== 'admin') redirect('/dashboard')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
      <style>{`
        @media (max-width: 900px) {
          div:first-child { flex-direction: column; }
          div:last-child { padding-top: 60px; }
        }
      `}</style>
    </div>
  )
}
