export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock_quantity: number
  created_at?: string
  updated_at?: string
}

export interface CartItem extends Product {
  quantity: number
}

export interface Order {
  id: string
  customer_email: string
  customer_name: string
  total_amount: number
  status: string
  stripe_payment_intent_id?: string
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
}