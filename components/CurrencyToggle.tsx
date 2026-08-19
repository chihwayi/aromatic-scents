'use client'

import { useCurrency } from '@/context/CurrencyContext'

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency()

  return (
    <button
      onClick={() => setCurrency(currency === 'ZAR' ? 'USD' : 'ZAR')}
      className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 border transition-all duration-300"
      style={{
        borderColor: 'var(--border)',
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}
      aria-label={`Switch currency to ${currency === 'ZAR' ? 'USD' : 'ZAR'}`}
    >
      {currency}
    </button>
  )
}
