import { getMyOrders } from '@/app/actions/orders'
import { getMyUploads } from '@/app/actions/uploads'
import { getCurrentUser } from '@/app/actions/auth'
import PaymentsPageContent from './PaymentsPageContent'

export default async function PaymentsPage() {
  const [orders, uploads, user] = await Promise.all([
    getMyOrders().catch(() => []),
    getMyUploads().catch(() => []),
    getCurrentUser(),
  ])
  const paymentUploads = uploads.filter(u => u.file_type === 'payment_receipt')
  const artworkUploads = uploads.filter(u => u.file_type === 'artwork_reference')
  return <PaymentsPageContent orders={orders} paymentUploads={paymentUploads} artworkUploads={artworkUploads} user={user} />
}
