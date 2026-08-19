'use client'

import { SessionProvider } from 'next-auth/react'
import { CurrencyProvider } from '@/context/CurrencyContext'
import type { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CurrencyProvider>{children}</CurrencyProvider>
    </SessionProvider>
  )
}
