import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  BOBPAY_CONFIG,
  verifyWebhookSignature,
  validatePayment,
  isValidBobPayIP,
  type BobPayWebhookPayload,
} from '@/lib/bobpay'

export async function POST(request: NextRequest) {
  let payload: BobPayWebhookPayload | null = null

  try {
    // ─── Parse payload ────────────────────────────────────────────────────
    payload = await request.json() as BobPayWebhookPayload

    // ─── 1. Verify source IP ──────────────────────────────────────────────
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      ''

    const ipValid = isValidBobPayIP(clientIp)

    // In sandbox/dev, skip IP check (localhost webhooks via ngrok have different IPs)
    if (!BOBPAY_CONFIG.isSandbox && !ipValid) {
      await logWebhook(payload, clientIp, false, false, 'Invalid IP')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ─── 2. Verify signature ──────────────────────────────────────────────
    const signatureValid = verifyWebhookSignature(payload, BOBPAY_CONFIG.passphrase)

    // In sandbox, only log invalid signatures (don't block) for easier testing
    if (!BOBPAY_CONFIG.isSandbox && !signatureValid) {
      await logWebhook(payload, clientIp, ipValid, false, 'Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // ─── 3. Idempotency — check if already processed ──────────────────────
    const { data: existingLog } = await supabase
      .from('webhook_logs')
      .select('id, processed')
      .eq('event_id', payload.uuid)
      .eq('processed', true)
      .maybeSingle()

    if (existingLog) {
      // Already processed — return 200 to prevent BobPay retries
      return NextResponse.json({ status: 'already_processed' })
    }

    // ─── 4. Validate payment with BobPay ─────────────────────────────────
    const isValid = await validatePayment(payload)

    if (!isValid) {
      await logWebhook(payload, clientIp, ipValid, signatureValid, 'BobPay validation failed')
      return NextResponse.json({ error: 'Payment validation failed' }, { status: 400 })
    }

    // ─── 5. Verify amount matches our order ───────────────────────────────
    const { data: order } = await supabase
      .from('orders')
      .select('id, total_amount, status')
      .eq('custom_payment_id', payload.custom_payment_id)
      .maybeSingle()

    if (!order) {
      await logWebhook(payload, clientIp, ipValid, signatureValid, 'Order not found')
      // Return 200 to acknowledge receipt (prevent retries for unknown orders)
      return NextResponse.json({ status: 'order_not_found' })
    }

    // Verify amount (allow ±1 cent tolerance for floating point)
    const expectedAmount = parseFloat(order.total_amount.toString())
    const amountMatch = Math.abs(payload.paid_amount - expectedAmount) < 0.02

    // ─── 6. Update order status in Supabase ──────────────────────────────
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status:               payload.status,
        bobpay_uuid:          payload.uuid,
        bobpay_short_ref:     payload.short_reference,
        bobpay_payment_id:    payload.payment_id,
        paid_amount:          payload.paid_amount,
        payment_method:       payload.payment_method,
        from_bank:            payload.from_bank || null,
        is_test:              payload.is_test,
        webhook_payload:      payload,
        webhook_received_at:  new Date().toISOString(),
      })
      .eq('custom_payment_id', payload.custom_payment_id)

    if (updateError) {
      console.error('Failed to update order:', updateError)
    }

    // ─── 7. Log the webhook ───────────────────────────────────────────────
    await logWebhook(
      payload,
      clientIp,
      ipValid,
      signatureValid,
      amountMatch ? null : `Amount mismatch: expected ${expectedAmount}, got ${payload.paid_amount}`,
      order.id,
      true
    )

    // ─── 8. Post-payment actions (stock reduction, notifications, etc.) ───
    if (payload.status === 'paid' && amountMatch) {
      await handleSuccessfulPayment(payload, order.id)
    }

    // ─── Always return 200 to acknowledge receipt ─────────────────────────
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook processing error:', error)

    // Log the error if we have payload
    if (payload) {
      await logWebhook(payload, '', false, false, `Exception: ${error}`)
    }

    // Return 200 to prevent unnecessary retries for parsing errors
    return NextResponse.json({ status: 'received' })
  }
}

// ─── Handle Successful Payment ────────────────────────────────────────────────
async function handleSuccessfulPayment(
  payload: BobPayWebhookPayload,
  orderId: string
) {
  try {
    // Fetch the order items to reduce stock
    const { data: order } = await supabase
      .from('orders')
      .select('items')
      .eq('id', orderId)
      .single()

    if (!order?.items) return

    const items = order.items as Array<{
      variantId: string
      quantity: number
    }>

    // Reduce stock for each ordered variant
    for (const item of items) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', item.variantId)
        .single()

      if (variant) {
        const newStock = Math.max(0, variant.stock_quantity - item.quantity)
        await supabase
          .from('product_variants')
          .update({ stock_quantity: newStock })
          .eq('id', item.variantId)
      }
    }
  } catch (error) {
    console.error('Error in handleSuccessfulPayment:', error)
  }
}

// ─── Log Webhook ──────────────────────────────────────────────────────────────
async function logWebhook(
  payload: BobPayWebhookPayload,
  ip: string,
  ipValid: boolean,
  sigValid: boolean,
  error: string | null = null,
  orderId?: string,
  processed = false
) {
  try {
    await supabase.from('webhook_logs').insert({
      source:          'bobpay',
      event_id:        payload.uuid || null,
      order_id:        orderId || null,
      status:          payload.status || null,
      payload:         payload,
      ip_address:      ip,
      signature_valid: sigValid,
      processed:       processed,
      error:           error,
    })
  } catch (e) {
    console.error('Failed to log webhook:', e)
  }
}
