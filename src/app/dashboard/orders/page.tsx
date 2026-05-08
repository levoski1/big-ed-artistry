import { getMyOrders } from '@/app/actions/orders'
import { createClient } from '@/lib/supabase/server'
import OrdersPageContent from './OrdersPageContent'

export default async function MyOrdersPage() {
  const supabase = await createClient()
  const [orders, paymentsRes] = await Promise.all([
    getMyOrders().catch(() => []),
    supabase.from('payments').select('order_id, status, amount, payment_type').order('created_at', { ascending: false }),
  ])

  const payments = paymentsRes.data ?? []

  // Map: order_id → { status, totalSubmitted }
  const paymentMap: Record<string, { status: string; totalSubmitted: number }> = {}
  for (const p of payments) {
    if (!paymentMap[p.order_id]) {
      paymentMap[p.order_id] = { status: p.status, totalSubmitted: 0 }
    }
    paymentMap[p.order_id].totalSubmitted += p.amount
  }

  return <OrdersPageContent orders={orders} paymentMap={paymentMap} />
}
