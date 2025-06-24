'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      // You can fetch order details here if needed
      // For now, we'll just show a success message
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600 animate-pulse">Processing your order...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Order Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for your purchase! Your order has been successfully processed.
          </p>
          
          {sessionId && (
            <p className="text-sm text-gray-500 mb-8">
              Order ID: {sessionId}
            </p>
          )}
          
          <div className="space-y-4">
            <p className="text-gray-600">
              You will receive an email confirmation shortly with your order details.
            </p>
            
            <Link 
              href="/" 
              className="inline-block bg-gradient-to-r from-rose-500 to-amber-500 text-white px-8 py-3 rounded-full font-medium hover:from-rose-600 hover:to-amber-600 transition-all duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}