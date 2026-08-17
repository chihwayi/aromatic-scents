import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function toOrderDTO(order: {
  id: string
  customPaymentId: string
  customerEmail: string
  totalAmount: number
  paidAmount: number | null
  status: string
  paymentMethod: string | null
  includeDelivery: boolean
  deliveryCost: number
  items: string
  isTest: boolean
  createdAt: Date
}) {
  return {
    id:                order.id,
    custom_payment_id: order.customPaymentId,
    customer_email:    order.customerEmail,
    total_amount:      order.totalAmount,
    paid_amount:       order.paidAmount,
    status:            order.status,
    payment_method:    order.paymentMethod,
    include_delivery:  order.includeDelivery,
    delivery_cost:     order.deliveryCost,
    items:             JSON.parse(order.items),
    is_test:           order.isTest,
    created_at:        order.createdAt.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    if (searchParams.get('stats')) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const [total, paid, pending, failed, cancelled, paidAgg, last30Agg] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'paid' } }),
        prisma.order.count({ where: { status: 'pending' } }),
        prisma.order.count({ where: { status: 'failed' } }),
        prisma.order.count({ where: { status: 'cancelled' } }),
        prisma.order.aggregate({
          where: { status: 'paid' },
          _sum: { paidAmount: true, deliveryCost: true },
          _avg: { paidAmount: true },
        }),
        prisma.order.aggregate({
          where: { status: 'paid', createdAt: { gte: thirtyDaysAgo } },
          _sum: { paidAmount: true },
        }),
      ])

      return NextResponse.json({
        total_orders:              total,
        paid_orders:                paid,
        pending_orders:             pending,
        failed_orders:              failed,
        cancelled_orders:           cancelled,
        total_revenue:              paidAgg._sum.paidAmount ?? 0,
        avg_order_value:            paidAgg._avg.paidAmount ?? 0,
        total_delivery_collected:   paidAgg._sum.deliveryCost ?? 0,
        revenue_last_30_days:       last30Agg._sum.paidAmount ?? 0,
      })
    }

    const limit = Number(searchParams.get('limit')) || 25
    const orderId = searchParams.get('custom_payment_id')

    if (orderId) {
      const order = await prisma.order.findUnique({ where: { customPaymentId: orderId } })
      if (!order) return NextResponse.json(null)
      return NextResponse.json(toOrderDTO(order))
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(orders.map(toOrderDTO))
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
