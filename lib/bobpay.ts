import crypto from 'crypto'

// ─── BobPay Environment ─────────────────────────────────────────────────────
export const BOBPAY_CONFIG = {
  apiKey: process.env.BOBPAY_API_KEY!,
  passphrase: process.env.BOBPAY_PASSPHRASE!,
  accountCode: process.env.BOBPAY_ACCOUNT_CODE!,
  isSandbox: process.env.BOBPAY_SANDBOX !== 'false',

  get apiBase() {
    return this.isSandbox
      ? 'https://api.sandbox.bobpay.co.za'
      : 'https://api.bobpay.co.za'
  },

  get paymentBase() {
    return this.isSandbox
      ? 'https://sandbox.bobpay.co.za'
      : 'https://my.bobpay.co.za'
  },

  // Static IPs that BobPay webhooks originate from
  allowedWebhookIPs: ['13.246.115.225', '13.246.100.25'],
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface BobPayCreateLinkPayload {
  recipient_account_code: string
  custom_payment_id: string
  email: string
  phone_number: string
  amount: number
  item_name: string
  item_description: string
  notify_url: string
  success_url: string
  pending_url: string
  cancel_url: string
  transacting_as_email?: string
  short_url?: boolean
}

export interface BobPayLinkResponse {
  url: string
  short_url?: string
}

export interface BobPayWebhookPayload {
  id: number
  uuid: string
  short_reference: string
  custom_payment_id: string
  amount: number
  paid_amount: number
  total_paid_amount: number
  status: 'paid' | 'unpaid' | 'failed' | 'cancelled' | 'processing' | 'refunded'
  payment_method: string
  original_requested_payment_method: string
  payment_id: number
  payment: {
    id: number
    payment_method_id: number
    payment_method: string
    amount: number
    status: string
  }
  item_name: string
  item_description: string
  recipient_account_code: string
  recipient_account_id: number
  email: string
  mobile_number: string
  from_bank: string
  time_created: string
  is_test: boolean
  signature: string
  notify_url: string
  success_url: string
  pending_url: string
  cancel_url: string
}

// ─── Signature Verification (for incoming webhooks) ─────────────────────────
export function verifyWebhookSignature(
  payload: BobPayWebhookPayload,
  passphrase: string
): boolean {
  const pairs = [
    `recipient_account_code=${encodeURIComponent(payload.recipient_account_code)}`,
    `custom_payment_id=${encodeURIComponent(payload.custom_payment_id)}`,
    `email=${encodeURIComponent(payload.email || '')}`,
    `mobile_number=${encodeURIComponent(payload.mobile_number || '')}`,
    `amount=${payload.amount.toFixed(2)}`,
    `item_name=${encodeURIComponent(payload.item_name || '')}`,
    `item_description=${encodeURIComponent(payload.item_description || '')}`,
    `notify_url=${encodeURIComponent(payload.notify_url)}`,
    `success_url=${encodeURIComponent(payload.success_url)}`,
    `pending_url=${encodeURIComponent(payload.pending_url)}`,
    `cancel_url=${encodeURIComponent(payload.cancel_url)}`,
  ]
  const signatureString = pairs.join('&') + `&passphrase=${passphrase}`
  const calculated = crypto.createHash('md5').update(signatureString).digest('hex')
  return calculated === payload.signature
}

// ─── IP Validation ───────────────────────────────────────────────────────────
export function isValidBobPayIP(ip: string): boolean {
  return BOBPAY_CONFIG.allowedWebhookIPs.includes(ip)
}

// ─── Create Payment Link ─────────────────────────────────────────────────────
export async function createPaymentLink(
  payload: BobPayCreateLinkPayload
): Promise<BobPayLinkResponse> {
  const res = await fetch(`${BOBPAY_CONFIG.apiBase}/payments/intents/link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${BOBPAY_CONFIG.apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`BobPay API error ${res.status}: ${error}`)
  }

  return res.json()
}

// ─── Validate Payment with BobPay ────────────────────────────────────────────
export async function validatePayment(
  webhookPayload: BobPayWebhookPayload
): Promise<boolean> {
  try {
    const res = await fetch(`${BOBPAY_CONFIG.apiBase}/payments/intents/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BOBPAY_CONFIG.apiKey}`,
      },
      body: JSON.stringify(webhookPayload),
    })
    return res.ok
  } catch {
    return false
  }
}

// ─── Order ID Generator ──────────────────────────────────────────────────────
export function generateOrderId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substr(2, 8).toUpperCase()
  return `AS-${date}-${random}`
}
