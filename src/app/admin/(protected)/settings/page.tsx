import { getCurrentUser } from '@/app/actions/auth'
import AdminSettingsContent from './AdminSettingsContent'

export default async function AdminSettingsPage() {
  const user = await getCurrentUser().catch(() => null)
  return <AdminSettingsContent user={user} />
}
