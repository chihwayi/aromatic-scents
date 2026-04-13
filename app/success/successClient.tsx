'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Order {
  custom_payment_id: string
  customer_email: string
  total_amount: number
  paid_amount: number
  payment_method: string
  status: string
  items: Array<{ name: string; size: number; quantity: number; price: number }>
  include_delivery: boolean
  delivery_cost: number
  created_at: string
}

export default function SuccessClient() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) { setLoading(false); return }

    const fetchOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('custom_payment_id', orderId)
        .maybeSingle()

      setOrder(data)
      setLoading(false)
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <div
            className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }}
          />
          <p className="section-label">Confirming your order...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-lg w-full">
        {/* Success card */}
        <div
          className="p-10 border text-center mb-4"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--gold)' }}
          >
            <CheckCircle className="h-9 w-9" style={{ color: 'var(--gold)' }} />
          </div>

          <p className="section-label mb-4">Order Confirmed</p>
          <h1
            className="font-display text-4xl mb-2"
            style={{ color: 'var(--text)', fontWeight: 300 }}
          >
            Thank You
          </h1>
          <div className="gold-line w-24 mx-auto my-6" />

          <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Your payment was successfully received. You&apos;ll receive a confirmation
            at{' '}
            <span style={{ color: 'var(--gold)' }}>
              {order?.customer_email || 'your email address'}
            </span>{' '}
            shortly.
          </p>

          {orderId && (
            <div
              className="text-xs px-4 py-3 mb-8"
              style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
              }}
            >
              Order Reference: <span style={{ color: 'var(--gold)' }}>{orderId}</span>
            </div>
          )}

          {/* Order summary */}
          {order && (
            <div
              className="text-left mb-8 p-5"
              style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-4 w-4" style={{ color: 'var(--gold)' }} />
                <span className="section-label">Order Summary</span>
              </div>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span>{item.name} {item.size}ml × {item.quantity}</span>
                    <span>R{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {order.include_delivery && (
                  <div className="flex justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span>Delivery</span>
                    <span>R{order.delivery_cost?.toFixed(2)}</span>
                  </div>
                )}
                <div
                  className="flex justify-between pt-3 mt-3"
                  style={{ borderTop: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  <span className="font-medium">Total Paid</span>
                  <span className="font-display text-xl" style={{ color: 'var(--gold)' }}>
                    R{(order.paid_amount || order.total_amount)?.toFixed(2)}
                  </span>
                </div>
                {order.payment_method && (
                  <div className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
                    Paid via {order.payment_method.replace(/-/g, ' ')}
                  </div>
                )}
              </div>
            </div>
          )}

          <Link href="/" className="btn-gold inline-flex items-center justify-center w-full">
            <span>Continue Shopping</span>
          </Link>
        </div>

        <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
          Questions? Reach us at{' '}
          <a href="mailto:info@aromaticscents.co.za" style={{ color: 'var(--gold)' }}>
            info@aromaticscents.co.za
          </a>
        </p>
      </div>
    </div>
  )
}
