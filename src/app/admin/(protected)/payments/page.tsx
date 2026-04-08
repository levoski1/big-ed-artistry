import { getAllPayments } from '@/app/actions/payments'
import AdminPaymentsContent from './AdminPaymentsContent'

export default async function AdminPaymentsPage() {
  const payments = await getAllPayments().catch(() => [])
  return <AdminPaymentsContent payments={payments} />
}
