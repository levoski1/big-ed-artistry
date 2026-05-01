import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPaymentReminder, sendToAdmin } from '@/lib/emailService'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verify authorization (simple token-based auth for cron jobs)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoISO = sevenDaysAgo.toISOString()

    // Find orders with partial payments where last payment was 7+ days ago
    const { data: orders, error: ordersError } = await admin
      .from('orders')
      .select('id, order_number, user_id, total_amount, amount_paid, amount_remaining, updated_at')
      .eq('payment_status', 'PARTIALLY_PAID')
      .lte('updated_at', sevenDaysAgoISO)

    if (ordersError) throw new Error(ordersError.message)
    if (!orders || orders.length === 0) {
      return NextResponse.json({ message: 'No reminders to send', count: 0 })
    }

    // Get last payment date for each order
    const orderIds = orders.map(o => o.id)
    const { data: payments } = await admin
      .from('payments')
      .select('order_id, created_at, verified_at')
      .in('order_id', orderIds)
      .eq('status', 'verified')
      .order('verified_at', { ascending: false })

    // Group payments by order_id and get the most recent
    const lastPaymentByOrder = new Map<string, string>()
    payments?.forEach(p => {
      if (!lastPaymentByOrder.has(p.order_id)) {
        lastPaymentByOrder.set(p.order_id, p.verified_at || p.created_at)
      }
    })

    // Filter orders where last payment was 7+ days ago
    const ordersToRemind = orders.filter(order => {
      const lastPaymentDate = lastPaymentByOrder.get(order.id)
      if (!lastPaymentDate) return false
      
      const lastPayment = new Date(lastPaymentDate)
      const daysSincePayment = (Date.now() - lastPayment.getTime()) / (1000 * 60 * 60 * 24)
      return daysSincePayment >= 7
    })

    if (ordersToRemind.length === 0) {
      return NextResponse.json({ message: 'No reminders to send', count: 0 })
    }

    // Get user profiles
    const userIds = ordersToRemind.map(o => o.user_id)
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds)

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

    // Send reminders
    const results = await Promise.allSettled(
      ordersToRemind.map(async (order) => {
        const profile = profileMap.get(order.user_id)
        if (!profile?.email) return { success: false, orderId: order.id, reason: 'No email' }

        const reminderData = {
          name: profile.full_name || profile.email,
          orderNumber: order.order_number,
          balanceDue: order.amount_remaining,
        }

        // Send to user
        const userResult = await sendPaymentReminder(profile.email, reminderData)
        
        // Send to admin
        const adminResult = await sendToAdmin(
          `Payment Reminder Sent — ${order.order_number}`,
          `<p>Payment reminder sent to <strong>${profile.full_name || profile.email}</strong> (${profile.email})</p>
           <p><strong>Order:</strong> ${order.order_number}</p>
           <p><strong>Balance Due:</strong> ₦${order.amount_remaining.toLocaleString()}</p>
           <p><strong>Amount Paid:</strong> ₦${order.amount_paid.toLocaleString()} / ₦${order.total_amount.toLocaleString()}</p>`
        )

        return {
          success: userResult.success && adminResult.success,
          orderId: order.id,
          orderNumber: order.order_number,
          userEmail: userResult.success,
          adminEmail: adminResult.success,
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    return NextResponse.json({
      message: 'Payment reminders processed',
      total: results.length,
      successful,
      failed,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'rejected' }),
    })
  } catch (error) {
    console.error('[payment-reminders] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
