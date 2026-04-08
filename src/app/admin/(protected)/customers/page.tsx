import { getAllCustomers } from '@/app/actions/admin'
import AdminCustomersContent from './AdminCustomersContent'

export default async function AdminCustomersPage() {
  const customers = await getAllCustomers().catch(() => [])
  return <AdminCustomersContent customers={customers} />
}
