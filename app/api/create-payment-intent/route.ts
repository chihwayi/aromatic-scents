import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

interface CartItem {
  variantId: string
  name: string
  size: number
  price: number
  quantity: number
  isBulkPrice: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { items, includeDelivery, customerType }: { 
      items: CartItem[], 
      includeDelivery: boolean,
      customerType: 'regular' | 'reseller'
    } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    // Get delivery cost from settings
    let deliveryCost = 0
    if (includeDelivery) {
      const { data: settings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'delivery_cost')
        .single()
      
      deliveryCost = settings ? parseFloat(settings.value) : 0
    }

    // Calculate subtotal
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
    const total = subtotal + deliveryCost

    // Prepare line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'zar',
        product_data: {
          name: `${item.name} (${item.size}ml)${item.isBulkPrice ? ' - Bulk Price' : ''}`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    // Add delivery as a line item if requested
    if (includeDelivery && deliveryCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'zar',
          product_data: {
            name: 'Delivery Service',
          },
          unit_amount: Math.round(deliveryCost * 100),
        },
        quantity: 1,
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      locale: 'en',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}?canceled=true`,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['ZA'],
      },
      metadata: {
        customer_type: customerType,
        includes_delivery: includeDelivery.toString(),
        delivery_cost: deliveryCost.toString(),
        subtotal: subtotal.toString(),
        order_items: JSON.stringify(items.map(item => ({
          variantId: item.variantId,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          isBulkPrice: item.isBulkPrice
        })))
      }
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}