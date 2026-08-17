import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Product, ProductVariant } from '@prisma/client'

// Define types for the request data
interface ProductVariantInput {
  size_ml: number
  regular_price: number
  bulk_price?: number
  bulk_min_quantity?: number
  stock_quantity: number
}

interface ProductInput {
  name: string
  description: string
  image_url: string
  is_new_arrival?: boolean
}

interface CreateProductRequest {
  product: ProductInput
  variants: ProductVariantInput[]
}

interface UpdateProductRequest {
  id: string
  product: ProductInput
  variants: ProductVariantInput[]
}

function toProductDTO(product: Product & { variants: ProductVariant[] }) {
  return {
    id:             product.id,
    name:           product.name,
    description:    product.description,
    image_url:      product.imageUrl,
    is_new_arrival: product.isNewArrival,
    fragrance_notes: product.fragranceNotes ? JSON.parse(product.fragranceNotes) : null,
    created_at:     product.createdAt.toISOString(),
    updated_at:     product.updatedAt.toISOString(),
    product_variants: product.variants.map(v => ({
      id:                v.id,
      size_ml:           v.sizeMl,
      regular_price:     v.regularPrice,
      bulk_price:        v.bulkPrice,
      bulk_min_quantity: v.bulkMinQuantity,
      stock_quantity:    v.stockQuantity,
    })),
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products.map(toProductDTO))
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { product, variants }: CreateProductRequest = await request.json()

    const created = await prisma.product.create({
      data: {
        name:         product.name,
        description:  product.description,
        imageUrl:     product.image_url,
        isNewArrival: product.is_new_arrival || false,
        variants: {
          create: (variants || []).map(v => ({
            sizeMl:          v.size_ml,
            regularPrice:    v.regular_price,
            bulkPrice:       v.bulk_price,
            bulkMinQuantity: v.bulk_min_quantity ?? 6,
            stockQuantity:   v.stock_quantity,
          })),
        },
      },
      include: { variants: true },
    })

    return NextResponse.json(toProductDTO(created))
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, product, variants }: UpdateProductRequest = await request.json()

    const updated = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name:         product.name,
          description:  product.description,
          imageUrl:     product.image_url,
          isNewArrival: product.is_new_arrival || false,
        },
      })

      await tx.productVariant.deleteMany({ where: { productId: id } })

      for (const v of variants || []) {
        await tx.productVariant.create({
          data: {
            productId:       id,
            sizeMl:          v.size_ml,
            regularPrice:    v.regular_price,
            bulkPrice:       v.bulk_price,
            bulkMinQuantity: v.bulk_min_quantity ?? 6,
            stockQuantity:   v.stock_quantity,
          },
        })
      }

      return tx.product.findUniqueOrThrow({ where: { id }, include: { variants: true } })
    })

    return NextResponse.json(toProductDTO(updated))
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Variants are deleted automatically via onDelete: Cascade
    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
