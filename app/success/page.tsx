import { Suspense } from 'react'
import SuccessClient from './successClient'

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-gray-600">Loading...</div>}>
      <SuccessClient />
    </Suspense>
  )
}