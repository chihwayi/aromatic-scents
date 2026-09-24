import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Serves a product's image as a real binary response instead of embedding it
// as a base64 string inside the /api/products JSON payload. This lets the
// browser load images in parallel via normal <img>/<Image> requests (and
// cache them) instead of the whole page blocking on one giant JSON blob
// containing every product's image at once.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    select: { imageUrl: true, updatedAt: true },
  })

  if (!product?.imageUrl) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Only base64 data URIs are served here — anything else (an external http
  // URL) should never have been rewritten to point at this endpoint.
  const match = product.imageUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    return NextResponse.json({ error: 'Not an inline image' }, { status: 404 })
  }

  const [, mimeType, base64Data] = match
  const buffer = Buffer.from(base64Data, 'base64')

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mimeType,
      // The URL includes a ?v= cache-buster tied to the product's updatedAt,
      // so it's safe to cache aggressively — a new upload gets a new URL.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
