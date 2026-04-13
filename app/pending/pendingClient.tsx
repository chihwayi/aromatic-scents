'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Clock, RefreshCw } from 'lucide-react'

export default function PendingClient() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="max-w-lg w-full text-center p-10 border"
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
          <Clock className="h-9 w-9" style={{ color: 'var(--gold)' }} />
        </div>

        {/* Heading */}
        <p className="section-label mb-4">Payment Status</p>
        <h1
          className="font-display text-4xl mb-2"
          style={{ color: 'var(--text)', fontWeight: 300 }}
        >
          Payment Pending
        </h1>
        <div className="gold-line w-24 mx-auto my-6" />

        <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Your payment is being processed. This can take a few minutes depending
          on your payment method. We&apos;ll notify you as soon as it&apos;s confirmed.
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

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="btn-gold inline-flex items-center justify-center gap-2 w-full"
          >
            <span>Return to Store</span>
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="btn-outline-gold inline-flex items-center justify-center gap-2 w-full"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Check Status</span>
          </button>
        </div>

        <p className="text-xs mt-8" style={{ color: 'var(--text-faint)' }}>
          Queries? Contact us at{' '}
          <a
            href="mailto:info@aromaticscents.co.za"
            style={{ color: 'var(--gold)' }}
          >
            info@aromaticscents.co.za
          </a>{' '}
          or WhatsApp{' '}
          <a href="tel:+27849615725" style={{ color: 'var(--gold)' }}>
            +27 849 615 725
          </a>
        </p>
      </div>
    </div>
  )
}
