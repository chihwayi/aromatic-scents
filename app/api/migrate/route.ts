import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Mark some existing products as new arrivals
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .limit(2)
    
    if (fetchError) throw fetchError
    
    if (products && products.length > 0) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ is_new_arrival: true })
        .in('id', products.map(p => p.id))
      
      if (updateError) throw updateError
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully',
      updatedProducts: products?.length || 0
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error },
      { status: 500 }
    )
  }
}