import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Define types for the request data
interface ProductVariant {
  size_ml: number
  regular_price: number
  bulk_price?: number
  bulk_min_quantity?: number
  stock_quantity: number
}

interface Product {
  name: string
  description: string
  image_url: string
  is_new_arrival?: boolean
}

interface CreateProductRequest {
  product: Product
  variants: ProductVariant[]
}

interface UpdateProductRequest {
  id: string
  product: Product
  variants: ProductVariant[]
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (
          id,
          size_ml,
          regular_price,
          bulk_price,
          bulk_min_quantity,
          stock_quantity
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
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

    // Insert product first
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        description: product.description,
        image_url: product.image_url,
        is_new_arrival: product.is_new_arrival || false
      }])
      .select()

    if (productError) throw productError

    const productId = productData[0].id

    // Insert variants
    if (variants && variants.length > 0) {
      const variantInserts = variants.map((variant: ProductVariant) => ({
        product_id: productId,
        size_ml: variant.size_ml,
        regular_price: variant.regular_price,
        bulk_price: variant.bulk_price,
        bulk_min_quantity: variant.bulk_min_quantity,
        stock_quantity: variant.stock_quantity
      }))

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantInserts)

      if (variantError) throw variantError
    }

    // Fetch the complete product with variants
    const { data: completeProduct, error: fetchError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (
          id,
          size_ml,
          regular_price,
          bulk_price,
          bulk_min_quantity,
          stock_quantity
        )
      `)
      .eq('id', productId)
      .single()

    if (fetchError) throw fetchError

    return NextResponse.json(completeProduct)
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

    // Update product
    const { error: productError } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description,
        image_url: product.image_url,
        is_new_arrival: product.is_new_arrival || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (productError) throw productError

    // Delete existing variants
    const { error: deleteError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', id)

    if (deleteError) throw deleteError

    // Insert new variants
    if (variants && variants.length > 0) {
      const variantInserts = variants.map((variant: ProductVariant) => ({
        product_id: id,
        size_ml: variant.size_ml,
        regular_price: variant.regular_price,
        bulk_price: variant.bulk_price,
        bulk_min_quantity: variant.bulk_min_quantity,
        stock_quantity: variant.stock_quantity
      }))

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantInserts)

      if (variantError) throw variantError
    }

    // Fetch the updated product with variants
    const { data: updatedProduct, error: fetchError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (
          id,
          size_ml,
          regular_price,
          bulk_price,
          bulk_min_quantity,
          stock_quantity
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    return NextResponse.json(updatedProduct)
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

    // Delete product (variants will be deleted automatically due to cascade)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}