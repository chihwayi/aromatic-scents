import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  BOBPAY_CONFIG,
  createPaymentLink,
  generateOrderId,
} from '@/lib/bobpay'

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
    const {
      items,
      includeDelivery,
      customerType,
      customerEmail,
      customerPhone,
    }: {
      items: CartItem[]
      includeDelivery: boolean
      customerType: 'regular' | 'reseller'
      customerEmail: string
      customerPhone?: string
    } = await request.json()

    // ─── Validate inputs ──────────────────────────────────────────────────
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }
    if (!customerEmail || !customerEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // ─── Fetch delivery cost from settings ────────────────────────────────
    let deliveryCost = 0
    if (includeDelivery) {
      const { data: settings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'delivery_cost')
        .single()
      deliveryCost = settings ? parseFloat(settings.value) : 50
    }

    // ─── Calculate totals ─────────────────────────────────────────────────
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total = subtotal + deliveryCost

    // ─── Generate internal order ID ───────────────────────────────────────
    const customPaymentId = generateOrderId()

    // ─── Build item description ───────────────────────────────────────────
    const itemDescription = items
      .map((item) => `${item.name} ${item.size}ml x${item.quantity}`)
      .join(', ')

    // ─── Build callback URLs ──────────────────────────────────────────────
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `${request.headers.get('x-forwarded-proto') ?? 'https'}://${request.headers.get('host')}`
    const notifyUrl  = `${baseUrl}/api/bobpay/webhook`
    const successUrl = `${baseUrl}/success?order_id=${customPaymentId}`
    const pendingUrl = `${baseUrl}/pending?order_id=${customPaymentId}`
    const cancelUrl  = `${baseUrl}?payment=cancelled`

    // ─── Save order to Supabase (status: pending) ─────────────────────────
    const { error: dbError } = await supabase.from('orders').insert({
      custom_payment_id: customPaymentId,
      customer_email:    customerEmail,
      customer_phone:    customerPhone || null,
      customer_type:     customerType,
      items:             items,
      subtotal:          subtotal,
      delivery_cost:     deliveryCost,
      total_amount:      total,
      currency:          'ZAR',
      status:            'pending',
      include_delivery:  includeDelivery,
      is_test:           BOBPAY_CONFIG.isSandbox,
    })

    if (dbError) {
      console.error('Failed to save order to Supabase:', dbError)
      // Non-fatal — continue with payment even if DB write fails
      // In production you may want to make this fatal
    }

    // ─── Create BobPay payment link ───────────────────────────────────────
    const bobpayResponse = await createPaymentLink({
      recipient_account_code: BOBPAY_CONFIG.accountCode,
      custom_payment_id:      customPaymentId,
      email:                  customerEmail,
      phone_number:           customerPhone || '',
      amount:                 total,
      item_name:              `Aromatic Scents Order — ${customPaymentId}`,
      item_description:       itemDescription,
      notify_url:             notifyUrl,
      success_url:            successUrl,
      pending_url:            pendingUrl,
      cancel_url:             cancelUrl,
      transacting_as_email:   customerEmail,
      short_url:              false,
    })

    return NextResponse.json({
      paymentUrl:      bobpayResponse.url,
      customPaymentId: customPaymentId,
      total:           total,
    })
  } catch (error) {
    console.error('BobPay pay route error:', error)
    return NextResponse.json(
      { error: 'Payment initialization failed. Please try again.' },
      { status: 500 }
    )
  }
}
