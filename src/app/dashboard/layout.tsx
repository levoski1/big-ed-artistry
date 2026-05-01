import { type ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <DashboardSidebar />
      <div className="dashboard-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {children}
      </div>
    </div>
  )
}
