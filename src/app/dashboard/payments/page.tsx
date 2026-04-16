import { getMyOrders } from '@/app/actions/orders'
import { getMyUploads } from '@/app/actions/uploads'
import PaymentsPageContent from './PaymentsPageContent'

export default async function PaymentsPage() {
  const [orders, uploads] = await Promise.all([
    getMyOrders().catch(() => []),
    getMyUploads().catch(() => []),
  ])
  const paymentUploads = uploads.filter(u => u.file_type === 'payment_receipt')
  const artworkUploads = uploads.filter(u => u.file_type === 'artwork_reference')
  return <PaymentsPageContent orders={orders} paymentUploads={paymentUploads} artworkUploads={artworkUploads} />
}
