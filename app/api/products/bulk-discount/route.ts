import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface BulkDiscountRequest {
  percent: number | null
  starts_at?: string | null
  ends_at?: string | null
  product_ids?: string[] // omit/empty = apply to all products
}

// Applies (or clears, when percent is null) the same discount to many
// products at once — used for storewide sales so the admin doesn't have to
// edit every product individually.
export async function POST(request: NextRequest) {
  try {
    const { percent, starts_at, ends_at, product_ids }: BulkDiscountRequest = await request.json()

    const where = product_ids && product_ids.length > 0 ? { id: { in: product_ids } } : {}

    const result = await prisma.product.updateMany({
      where,
      data: {
        discountPercent:  percent,
        discountStartsAt: starts_at ? new Date(starts_at) : null,
        discountEndsAt:   ends_at ? new Date(ends_at) : null,
      },
    })

    return NextResponse.json({ success: true, updated: result.count })
  } catch (error) {
    console.error('Error applying bulk discount:', error)
    return NextResponse.json({ error: 'Failed to apply bulk discount' }, { status: 500 })
  }
}
