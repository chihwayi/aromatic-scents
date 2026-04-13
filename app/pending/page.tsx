import { Suspense } from 'react'
import PendingClient from './pendingClient'

export const metadata = {
  title: 'Payment Pending — Aromatic Scents',
}

export default function PendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
          <div className="text-center">
            <div
              className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }}
            />
            <p className="section-label">Processing...</p>
          </div>
        </div>
      }
    >
      <PendingClient />
    </Suspense>
  )
}
