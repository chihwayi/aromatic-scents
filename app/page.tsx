'use client'

import { useState, useEffect } from 'react'
import {
  ShoppingBag, Plus, Minus, Facebook, Instagram, Twitter,
  Mail, Phone, MapPin, Heart, Star, X, Sun, Moon, ChevronLeft,
  Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProductVariant {
  id: string
  size_ml: number
  regular_price: number
  bulk_price: number | null
  bulk_min_quantity: number
  stock_quantity: number
}

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  is_new_arrival?: boolean
  fragrance_notes?: { top?: string; heart?: string; base?: string }
  product_variants: ProductVariant[]
}

interface CartItem {
  variantId: string
  productId: string
  name: string
  size: number
  price: number
  quantity: number
  isBulkPrice: boolean
  image_url: string
}

interface Settings {
  delivery_cost: string
  bulk_discount_enabled: string
}

// ─── Static testimonials ──────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Nomsa K.',
    location: 'Johannesburg',
    stars: 5,
    text: 'Midnight Elegance is everything. The longevity is incredible — I still get compliments hours after applying. Easily the most luxurious fragrance I\'ve worn.',
  },
  {
    name: 'Thabo M.',
    location: 'Cape Town',
    stars: 5,
    text: 'Ordered the 100ml Golden Sunset as a gift and the presentation was immaculate. The scent is warm and sophisticated — my wife was absolutely blown away.',
  },
  {
    name: 'Lesedi R.',
    location: 'Pretoria',
    stars: 5,
    text: 'The reseller pricing is exceptional. I now stock three of their fragrances in my boutique and my clients keep coming back for more. Delivery is always prompt.',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  // Data state
  const [products, setProducts]           = useState<Product[]>([])
  const [newArrivals, setNewArrivals]     = useState<Product[]>([])
  const [loading, setLoading]             = useState(true)
  const [settings, setSettings]           = useState<Settings>({ delivery_cost: '50.00', bulk_discount_enabled: 'true' })

  // UI state
  const [theme, setTheme]                 = useState<'rose' | 'noir'>('rose')
  const [favorites, setFavorites]         = useState<string[]>([])
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: string }>({})
  const [customerType, setCustomerType]   = useState<'regular' | 'reseller'>('regular')

  // Cart state
  const [cart, setCart]                   = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen]       = useState(false)
  const [includeDelivery, setIncludeDelivery] = useState(false)

  // Checkout state (BobPay)
  const [checkoutStep, setCheckoutStep]   = useState<'cart' | 'details'>('cart')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  // Cancelled flash message
  const [showCancelledMsg, setShowCancelledMsg] = useState(false)

  const phoneNumber  = '27849615725'
  const whatsappUrl  = `https://wa.me/${phoneNumber}?text=Hi! I'm interested in your perfume collection.`

  // ─── Theme: persist in localStorage + apply to <html> ─────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = (window.localStorage.getItem('as-theme') as 'rose' | 'noir') || 'rose'
    setTheme(saved)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('as-theme', theme)
  }, [theme])

  // ─── Show cancelled flash ──────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'cancelled') {
      setShowCancelledMsg(true)
      window.history.replaceState({}, '', '/')
      setTimeout(() => setShowCancelledMsg(false), 6000)
    }
  }, [])

  // ─── Fetch data ────────────────────────────────────────────────────────────
  useEffect(() => { fetchProducts(); fetchSettings() }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`*, product_variants (id, size_ml, regular_price, bulk_price, bulk_min_quantity, stock_quantity)`)
        .order('created_at', { ascending: false })

      if (error) throw error

      const withStock = (data || []).filter(p =>
        p.product_variants.some((v: ProductVariant) => v.stock_quantity > 0)
      )
      const arrivals  = withStock.filter(p => p.is_new_arrival)
      const regular   = withStock.filter(p => !p.is_new_arrival)

      setNewArrivals(arrivals)
      setProducts(regular)

      const initial: { [key: string]: string } = {}
      withStock.forEach(p => {
        const avail = p.product_variants.find((v: ProductVariant) => v.stock_quantity > 0)
        if (avail) initial[p.id] = avail.id
      })
      setSelectedVariants(initial)
    } catch (e) {
      console.error('Error fetching products:', e)
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*')
      if (error) throw error
      const obj = (data || []).reduce((acc: Settings, s: { key: string; value: string }) => {
        acc[s.key as keyof Settings] = s.value
        return acc
      }, {} as Settings)
      setSettings(obj)
    } catch (e) {
      console.error('Error fetching settings:', e)
    }
  }

  // ─── Pricing helpers ───────────────────────────────────────────────────────
  const getSelectedVariant = (product: Product): ProductVariant | null => {
    const id = selectedVariants[product.id]
    return product.product_variants.find(v => v.id === id) || null
  }

  const getEffectivePrice = (variant: ProductVariant, quantity: number) => {
    const bulk =
      customerType === 'reseller' &&
      variant.bulk_price &&
      quantity >= variant.bulk_min_quantity &&
      settings.bulk_discount_enabled === 'true'
    return { price: bulk ? variant.bulk_price! : variant.regular_price, isBulkPrice: !!bulk }
  }

  // ─── Cart helpers ──────────────────────────────────────────────────────────
  const addToCart = (product: Product) => {
    const variant = getSelectedVariant(product)
    if (!variant) return
    const { price, isBulkPrice } = getEffectivePrice(variant, 1)

    setCart(prev => {
      const existing = prev.find(i => i.variantId === variant.id)
      if (existing) {
        const newQty = existing.quantity + 1
        const { price: newPrice, isBulkPrice: newBulk } = getEffectivePrice(variant, newQty)
        return prev.map(i =>
          i.variantId === variant.id
            ? { ...i, quantity: newQty, price: newPrice, isBulkPrice: newBulk }
            : i
        )
      }
      return [...prev, {
        variantId: variant.id, productId: product.id, name: product.name,
        size: variant.size_ml, price, quantity: 1, isBulkPrice, image_url: product.image_url,
      }]
    })
  }

  const updateQuantity = (variantId: string, change: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.variantId !== variantId) return item
        const newQty = item.quantity + change
        if (newQty <= 0) return null as unknown as CartItem
        const product = [...products, ...newArrivals].find(p => p.id === item.productId)
        const variant = product?.product_variants.find(v => v.id === variantId)
        if (variant) {
          const { price, isBulkPrice } = getEffectivePrice(variant, newQty)
          return { ...item, quantity: newQty, price, isBulkPrice }
        }
        return { ...item, quantity: newQty }
      }).filter(Boolean) as CartItem[]
    )
  }

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const getSubtotal    = () => cart.reduce((t, i) => t + i.price * i.quantity, 0)
  const getDeliveryCost = () => includeDelivery ? parseFloat(settings.delivery_cost || '0') : 0
  const getTotalPrice  = () => getSubtotal() + getDeliveryCost()
  const totalItems     = () => cart.reduce((t, i) => t + i.quantity, 0)

  // ─── BobPay Checkout ───────────────────────────────────────────────────────
  const handleBobPayCheckout = async () => {
    if (!customerEmail || !customerEmail.includes('@')) {
      setCheckoutError('Please enter a valid email address.')
      return
    }
    setCheckoutError('')
    setIsCheckingOut(true)

    try {
      const res = await fetch('/api/bobpay/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({
            variantId: i.variantId, name: i.name, size: i.size,
            price: i.price, quantity: i.quantity, isBulkPrice: i.isBulkPrice,
          })),
          includeDelivery,
          customerType,
          customerEmail,
          customerPhone,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Payment failed')
      }

      const { paymentUrl } = await res.json()
      window.location.href = paymentUrl
    } catch (err) {
      console.error('Checkout error:', err)
      setCheckoutError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsCheckingOut(false)
    }
  }

  // ─── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div
            className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-6"
            style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }}
          />
          <p className="font-display text-2xl" style={{ color: 'var(--text-muted)', fontWeight: 300 }}>
            Curating your collection...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ─── Cancelled Flash ─────────────────────────────────────────────── */}
      {showCancelledMsg && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 text-sm shadow-lg animate-fade-in"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          Payment was cancelled. Your cart is still saved.
        </div>
      )}

      {/* ─── Announcement Bar ────────────────────────────────────────────── */}
      <div className="announcement-bar">
        Complimentary gift wrapping on orders over R500&nbsp;·&nbsp;Nationwide delivery available
      </div>

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: 'var(--header-bg)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 flex items-center justify-center"
                style={{ background: 'var(--gold)', color: '#fff' }}
              >
                <span className="font-display text-lg" style={{ fontWeight: 400 }}>A</span>
              </div>
              <h1
                className="font-display text-2xl tracking-wide"
                style={{ color: 'var(--text)', fontWeight: 300 }}
              >
                Aromatic Scents
              </h1>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              {/* Customer Type */}
              <button
                onClick={() => setCustomerType(t => t === 'regular' ? 'reseller' : 'regular')}
                className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 border transition-all duration-300"
                style={{
                  borderColor: customerType === 'reseller' ? 'var(--gold)' : 'var(--border)',
                  color: customerType === 'reseller' ? 'var(--gold)' : 'var(--text-muted)',
                  background: customerType === 'reseller' ? 'var(--accent-light)' : 'transparent',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {customerType === 'reseller' ? '★ Reseller' : 'Regular'}
              </button>

              {/* Theme toggle */}
              <button
                className="theme-toggle"
                onClick={() => setTheme(t => t === 'rose' ? 'noir' : 'rose')}
                title={theme === 'rose' ? 'Switch to Noir' : 'Switch to Rose'}
              >
                {theme === 'rose'
                  ? <Moon className="h-3.5 w-3.5" />
                  : <Sun className="h-3.5 w-3.5" />
                }
              </button>

              {/* Cart */}
              <button
                onClick={() => { setIsCartOpen(true); setCheckoutStep('cart') }}
                className="relative flex items-center justify-center w-9 h-9 transition-colors"
                style={{ color: 'var(--text)' }}
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems() > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium"
                    style={{ background: 'var(--gold)', color: '#fff' }}
                  >
                    {totalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[60vh] md:min-h-[92vh] flex items-center overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
        {/* Decorative gold circles */}
        <div
          className="absolute top-1/4 right-[8%] w-72 h-72 rounded-full pointer-events-none animate-float"
          style={{ border: '1px solid var(--border-strong)', opacity: 0.5 }}
        />
        <div
          className="absolute bottom-1/4 right-[12%] w-48 h-48 rounded-full pointer-events-none animate-float anim-delay-200"
          style={{ border: '1px solid var(--border)', opacity: 0.35 }}
        />
        <div
          className="absolute top-1/3 right-[15%] w-6 h-6 rounded-full animate-float anim-delay-300"
          style={{ background: 'var(--gold)', opacity: 0.4 }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 pb-10 md:pt-12 md:pb-20">
          <div className="max-w-2xl">
            <p className="section-label mb-8 animate-fade-in-up">
              Premium Fragrances · South Africa
            </p>

            <h2
              className="font-display leading-none mb-4 sm:mb-8 animate-fade-in-up anim-delay-100"
              style={{
                color: 'var(--text)',
                fontWeight: 400,
                fontSize: 'clamp(2.5rem, 7vw, 6.5rem)',
                lineHeight: 1.05,
              }}
            >
              The Art
              <br />
              <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>of Scent</em>
            </h2>

            <div className="gold-line mb-4 sm:mb-8 animate-fade-in-up anim-delay-200" />

            <p
              className="text-sm sm:text-lg leading-relaxed mb-6 sm:mb-10 max-w-md animate-fade-in-up anim-delay-300"
              style={{ color: 'var(--text-muted)', fontWeight: 400 }}
            >
              Curated fragrances for those who understand that a signature scent
              is the most intimate expression of self. Available in 35ml, 50ml,
              and 100ml.
            </p>

            {customerType === 'reseller' && settings.bulk_discount_enabled === 'true' && (
              <div
                className="inline-flex items-center gap-3 px-4 py-2.5 mb-10 text-sm animate-fade-in-up anim-delay-300"
                style={{ border: '1px solid var(--gold)', color: 'var(--gold)', background: 'var(--accent-light)' }}
              >
                <Star className="h-3.5 w-3.5 fill-current" />
                <span style={{ letterSpacing: '0.08em' }}>Reseller pricing is active</span>
              </div>
            )}

            <div className="flex flex-wrap gap-4 animate-fade-in-up anim-delay-400">
              <a
                href="#collection"
                className="btn-gold inline-block"
                style={{ minWidth: '180px', textAlign: 'center' }}
              >
                <span>Shop Collection</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-gold inline-block"
                style={{ minWidth: '160px', textAlign: 'center' }}
              >
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-4 mt-8 md:mt-16 animate-fade-in-up anim-delay-500">
            {[
              { label: 'Multiple Sizes', sub: '35ml · 50ml · 100ml' },
              { label: 'Bulk Discounts', sub: 'For resellers & wholesale' },
              { label: 'Nationwide Delivery', sub: 'Fast & insured shipping' },
            ].map(f => (
              <div
                key={f.label}
                className="flex items-center gap-3 px-4 py-3"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--gold)' }} />
                <div>
                  <div className="text-xs font-medium" style={{ color: 'var(--text)', letterSpacing: '0.06em' }}>
                    {f.label}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── New Arrivals ─────────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section
          className="py-12 md:py-24"
          style={{ background: 'var(--bg-alt)' }}
          id="new-arrivals"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 md:mb-16">
              <p className="section-label mb-4">Just Arrived</p>
              <h3
                className="font-display text-3xl sm:text-5xl"
                style={{ color: 'var(--text)', fontWeight: 400 }}
              >
                New Fragrances
              </h3>
              <div className="gold-line-left mt-4" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
              {newArrivals.map((product, i) =>
                <ProductCard
                  key={product.id}
                  product={product}
                  selectedVariants={selectedVariants}
                  setSelectedVariants={setSelectedVariants}
                  getSelectedVariant={getSelectedVariant}
                  getEffectivePrice={getEffectivePrice}
                  customerType={customerType}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  addToCart={addToCart}
                  setIsCartOpen={setIsCartOpen}
                  isNew
                  delay={i * 100}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── Main Collection ──────────────────────────────────────────────── */}
      <section className="py-12 md:py-24" id="collection" style={{ background: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 md:mb-16">
            <p className="section-label mb-4">Our Range</p>
            <h3
              className="font-display text-3xl sm:text-5xl"
              style={{ color: 'var(--text)', fontWeight: 400 }}
            >
              The Collection
            </h3>
            <div className="gold-line-left mt-4" />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl mb-2" style={{ color: 'var(--text-muted)', fontWeight: 300 }}>
                Coming Soon
              </p>
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
                New fragrances are being added to the collection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
              {products.map((product, i) =>
                <ProductCard
                  key={product.id}
                  product={product}
                  selectedVariants={selectedVariants}
                  setSelectedVariants={setSelectedVariants}
                  getSelectedVariant={getSelectedVariant}
                  getEffectivePrice={getEffectivePrice}
                  customerType={customerType}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  addToCart={addToCart}
                  setIsCartOpen={setIsCartOpen}
                  delay={i * 100}
                />
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── Brand Story ─────────────────────────────────────────────────── */}
      <section className="py-12 md:py-24" style={{ background: 'var(--bg-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <p className="section-label mb-6">Our Philosophy</p>
              <h3
                className="font-display text-3xl sm:text-5xl mb-4 md:mb-6"
                style={{ color: 'var(--text)', fontWeight: 400, lineHeight: 1.1 }}
              >
                Scent is the
                <br />
                <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>most intimate</em>
                <br />
                sense of all
              </h3>
              <div className="gold-line-left mb-8" />
              <p
                className="text-base leading-relaxed mb-6"
                style={{ color: 'var(--text-muted)', fontWeight: 400 }}
              >
                At Aromatic Scents, we believe perfume is not merely a product — it is
                an invisible signature, a memory, an identity. Every fragrance in our
                collection is curated from the world&apos;s finest blending houses,
                selected for their depth, longevity, and the stories they tell.
              </p>
              <p
                className="text-base leading-relaxed mb-10"
                style={{ color: 'var(--text-muted)', fontWeight: 400 }}
              >
                From the bergamot-kissed opening of Midnight Elegance to the warm,
                vanilla-drenched dry-down of Golden Sunset — each bottle is an invitation
                to experience luxury you can carry with you, always.
              </p>
              <div className="flex flex-wrap gap-8">
                {[
                  { num: '50+', label: 'Fragrances Curated' },
                  { num: '3', label: 'Bottle Sizes' },
                  { num: '100%', label: 'Premium Quality' },
                ].map(s => (
                  <div key={s.label}>
                    <div
                      className="font-display text-3xl mb-1"
                      style={{ color: 'var(--gold)', fontWeight: 400 }}
                    >
                      {s.num}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative right panel */}
            <div className="relative">
              <div
                className="aspect-[4/5] relative"
                style={{ border: '1px solid var(--border)' }}
              >
                {newArrivals[0] || products[0] ? (
                  <Image
                    src={(newArrivals[0] || products[0]).image_url}
                    alt="Aromatic Scents"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'var(--surface-alt)' }}
                  >
                    <span
                      className="font-display text-7xl"
                      style={{ color: 'var(--gold)', opacity: 0.3, fontWeight: 300 }}
                    >
                      A
                    </span>
                  </div>
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }}
                />
                <div className="absolute bottom-8 left-8 right-8">
                  <p
                    className="font-display text-white text-2xl"
                    style={{ fontWeight: 300, fontStyle: 'italic' }}
                  >
                    &ldquo;Where passion meets perfection&rdquo;
                  </p>
                </div>
              </div>
              {/* Offset accent border */}
              <div
                className="absolute -bottom-4 -right-4 w-full h-full -z-10"
                style={{ border: '1px solid var(--border)', background: 'transparent' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ────────────────────────────────────────────────── */}
      <section className="py-12 md:py-24" style={{ background: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <p className="section-label mb-4">Client Stories</p>
            <h3
              className="font-display text-3xl sm:text-5xl"
              style={{ color: 'var(--text)', fontWeight: 400 }}
            >
              What Our Clients Say
            </h3>
            <div className="gold-line w-40 mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="flex gap-0.5 mb-6">
                  {[...Array(t.stars)].map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-current" style={{ color: 'var(--gold)' }} />
                  ))}
                </div>
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: 'var(--text-muted)', fontWeight: 400 }}
                >
                  {t.text}
                </p>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-faint)', letterSpacing: '0.08em' }}>
                    {t.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ background: 'var(--footer-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 flex items-center justify-center" style={{ background: 'var(--gold)' }}>
                  <span className="font-display text-white" style={{ fontWeight: 400 }}>A</span>
                </div>
                <h3 className="font-display text-2xl text-white" style={{ fontWeight: 400 }}>Aromatic Scents</h3>
              </div>
              <p className="text-sm leading-relaxed mb-8 max-w-sm" style={{ color: 'var(--footer-text)', fontWeight: 400 }}>
                Curated fragrances for the discerning individual. We bring the world&apos;s
                finest scents to South Africa — elegantly packaged, affordably priced.
              </p>
              <div className="flex gap-3">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 flex items-center justify-center transition-all duration-300"
                    style={{
                      border: '1px solid rgba(201,168,76,0.3)',
                      color: 'var(--footer-text)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold)'
                      ;(e.currentTarget as HTMLAnchorElement).style.color = '#fff'
                      ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--gold)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                      ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--footer-text)'
                      ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(201,168,76,0.3)'
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4
                className="text-xs font-medium mb-6"
                style={{ color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}
              >
                Explore
              </h4>
              <ul className="space-y-3">
                {['About Us', 'Our Story', 'Gift Cards', 'Fragrance Guide', 'Reseller Program'].map(l => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--footer-text)', fontWeight: 400 }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)'}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--footer-text)'}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4
                className="text-xs font-medium mb-6"
                style={{ color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}
              >
                Get In Touch
              </h4>
              <div className="space-y-4">
                {[
                  { Icon: MapPin, text: '123 Fragrance Avenue\nPretoria, South Africa' },
                  { Icon: Phone, text: '+27 849 615 725' },
                  { Icon: Mail, text: 'info@aromaticscents.co.za' },
                ].map(({ Icon, text }, i) => (
                  <div key={i} className="flex gap-3">
                    <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                    <span
                      className="text-sm whitespace-pre-line"
                      style={{ color: 'var(--footer-text)', fontWeight: 400 }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderTop: '1px solid rgba(201,168,76,0.15)' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              © {new Date().getFullYear()} Aromatic Scents. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Shipping Info'].map(l => (
                <a
                  key={l}
                  href="#"
                  className="text-xs transition-colors duration-200"
                  style={{ color: 'var(--text-faint)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-faint)'}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Floating CTAs ────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110"
          style={{ background: '#25D366' }}
        >
          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106" />
          </svg>
          <span
            className="absolute right-14 top-1/2 -translate-y-1/2 text-xs px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg"
            style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            Chat on WhatsApp
          </span>
        </a>
        <a
          href={`tel:+${phoneNumber}`}
          className="group relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110"
          style={{ background: 'var(--gold)' }}
        >
          <Phone className="h-5 w-5 text-white" />
          <span
            className="absolute right-14 top-1/2 -translate-y-1/2 text-xs px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg"
            style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            Call Us
          </span>
        </a>
      </div>

      {/* ─── Cart Sidebar ─────────────────────────────────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsCartOpen(false)}
          />

          {/* Panel */}
          <div
            className="cart-sidebar absolute right-0 top-0 h-full w-full max-w-md flex flex-col shadow-2xl"
          >
            {/* ── Cart Header ── */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                {checkoutStep === 'details' && (
                  <button
                    onClick={() => setCheckoutStep('cart')}
                    className="mr-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <div>
                  <h3 className="font-display text-xl" style={{ color: 'var(--text)', fontWeight: 400 }}>
                    {checkoutStep === 'cart' ? 'Your Cart' : 'Complete Order'}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                    {checkoutStep === 'cart'
                      ? `${totalItems()} ${totalItems() === 1 ? 'item' : 'items'}`
                      : 'Enter your details'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsCartOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ── Step 1: Cart Items ── */}
            {checkoutStep === 'cart' && (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-16">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--border-strong)' }} />
                      <p className="font-display text-xl mb-1" style={{ color: 'var(--text-muted)', fontWeight: 300 }}>
                        Your cart is empty
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                        Add a fragrance to begin
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div
                          key={item.variantId}
                          className="cart-item flex items-center gap-4 p-4"
                        >
                          <div className="w-14 h-14 flex-shrink-0 overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              width={56} height={56}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                              {item.name}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                              {item.size}ml
                              {item.isBulkPrice && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs" style={{ background: 'var(--accent-light)', color: 'var(--gold)' }}>
                                  Bulk
                                </span>
                              )}
                            </p>
                            <p className="text-sm font-medium mt-1" style={{ color: 'var(--gold)' }}>
                              R{item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => updateQuantity(item.variantId, -1)}
                              className="w-6 h-6 flex items-center justify-center transition-colors"
                              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-sm" style={{ color: 'var(--text)' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.variantId, 1)}
                              className="w-6 h-6 flex items-center justify-center transition-colors"
                              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div
                    className="border-t px-6 py-5 flex-shrink-0"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)' }}
                  >
                    {/* Delivery checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={includeDelivery}
                        onChange={e => setIncludeDelivery(e.target.checked)}
                        className="w-4 h-4 accent-amber-500"
                      />
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Include delivery (R{parseFloat(settings.delivery_cost || '0').toFixed(2)})
                      </span>
                    </label>

                    {/* Price breakdown */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span>Subtotal</span>
                        <span>R{getSubtotal().toFixed(2)}</span>
                      </div>
                      {includeDelivery && (
                        <div className="flex justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                          <span>Delivery</span>
                          <span>R{getDeliveryCost().toFixed(2)}</span>
                        </div>
                      )}
                      <div
                        className="flex justify-between items-center pt-3"
                        style={{ borderTop: '1px solid var(--border)' }}
                      >
                        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Total</span>
                        <span className="font-display text-2xl" style={{ color: 'var(--gold)', fontWeight: 400 }}>
                          R{getTotalPrice().toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setCheckoutStep('details')}
                      className="btn-gold w-full text-center"
                    >
                      <span>Proceed to Payment</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── Step 2: Customer Details ── */}
            {checkoutStep === 'details' && (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {/* Order mini-summary */}
                  <div
                    className="p-4 mb-6"
                    style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}
                  >
                    <p className="section-label mb-3">Order Summary</p>
                    {cart.map(item => (
                      <div key={item.variantId} className="flex justify-between text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                        <span>{item.name} {item.size}ml × {item.quantity}</span>
                        <span>R{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {includeDelivery && (
                      <div className="flex justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span>Delivery</span>
                        <span>R{getDeliveryCost().toFixed(2)}</span>
                      </div>
                    )}
                    <div
                      className="flex justify-between mt-3 pt-3"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Total</span>
                      <span className="font-display text-lg" style={{ color: 'var(--gold)', fontWeight: 400 }}>
                        R{getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Customer details form */}
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-xs mb-2"
                        style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 text-sm outline-none transition-colors"
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--gold)'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs mb-2"
                        style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                      >
                        Phone Number (optional)
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="+27 82 123 4567"
                        className="w-full px-4 py-3 text-sm outline-none transition-colors"
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--gold)'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                      />
                    </div>
                  </div>

                  {checkoutError && (
                    <p className="text-sm mt-4 px-3 py-2" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {checkoutError}
                    </p>
                  )}

                  <p className="text-xs mt-6" style={{ color: 'var(--text-faint)' }}>
                    You&apos;ll be redirected to the secure BobPay payment page to
                    complete your order. We support card, EFT, PayShap, Capitec Pay
                    and more.
                  </p>
                </div>

                <div
                  className="border-t px-6 py-5 flex-shrink-0"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)' }}
                >
                  <button
                    onClick={handleBobPayCheckout}
                    disabled={isCheckingOut || !customerEmail}
                    className="btn-gold w-full flex items-center justify-center gap-2"
                    style={{ opacity: isCheckingOut || !customerEmail ? 0.65 : 1 }}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Redirecting to BobPay...</span>
                      </>
                    ) : (
                      <span>Pay with BobPay — R{getTotalPrice().toFixed(2)}</span>
                    )}
                  </button>
                  <p className="text-xs text-center mt-3" style={{ color: 'var(--text-faint)' }}>
                    Secured by BobPay · SSL encrypted
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Product Card Component ────────────────────────────────────────────────────
function ProductCard({
  product,
  selectedVariants,
  setSelectedVariants,
  getSelectedVariant,
  getEffectivePrice,
  customerType,
  favorites,
  toggleFavorite,
  addToCart,
  setIsCartOpen,
  isNew = false,
  delay = 0,
}: {
  product: Product
  selectedVariants: { [key: string]: string }
  setSelectedVariants: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  getSelectedVariant: (p: Product) => ProductVariant | null
  getEffectivePrice: (v: ProductVariant, q: number) => { price: number; isBulkPrice: boolean }
  customerType: 'regular' | 'reseller'
  favorites: string[]
  toggleFavorite: (id: string) => void
  addToCart: (p: Product) => void
  setIsCartOpen: (v: boolean) => void
  isNew?: boolean
  delay?: number
}) {
  const selectedVariant  = getSelectedVariant(product)
  const effectivePrice   = selectedVariant ? getEffectivePrice(selectedVariant, 1) : null
  const isOutOfStock     = !selectedVariant || selectedVariant.stock_quantity === 0
  const isLowStock       = selectedVariant && selectedVariant.stock_quantity > 0 && selectedVariant.stock_quantity <= 5
  const isFav            = favorites.includes(product.id)

  return (
    <div
      className="card group relative flex flex-col animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* ── Image ── */}
      <div className="relative aspect-square sm:aspect-[3/4] overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges */}
        {isNew && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 text-xs"
            style={{
              background: 'var(--gold)',
              color: '#fff',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 500,
              fontSize: '0.6rem',
            }}
          >
            New
          </div>
        )}
        {isLowStock && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 text-xs"
            style={{
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 500,
              fontSize: '0.6rem',
            }}
          >
            Only {selectedVariant!.stock_quantity} left
          </div>
        )}

        {/* Favourite */}
        <button
          onClick={() => toggleFavorite(product.id)}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Heart
            className="h-4 w-4 transition-colors"
            style={{ color: isFav ? 'var(--gold)' : 'var(--text-faint)', fill: isFav ? 'var(--gold)' : 'none' }}
          />
        </button>

        {/* Fragrance Notes Overlay */}
        {product.fragrance_notes && (
          <div className="notes-overlay">
            <p className="section-label mb-2" style={{ color: 'rgba(201,168,76,0.9)' }}>
              Fragrance Notes
            </p>
            {product.fragrance_notes.top && (
              <p className="text-white text-xs mb-1">
                <span style={{ color: 'rgba(201,168,76,0.8)' }}>Top · </span>
                {product.fragrance_notes.top}
              </p>
            )}
            {product.fragrance_notes.heart && (
              <p className="text-white text-xs mb-1">
                <span style={{ color: 'rgba(201,168,76,0.8)' }}>Heart · </span>
                {product.fragrance_notes.heart}
              </p>
            )}
            {product.fragrance_notes.base && (
              <p className="text-white text-xs">
                <span style={{ color: 'rgba(201,168,76,0.8)' }}>Base · </span>
                {product.fragrance_notes.base}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-3 sm:p-6">
        <h3
          className="font-display text-base sm:text-2xl mb-1"
          style={{ color: 'var(--text)', fontWeight: 500, lineHeight: 1.2 }}
        >
          {product.name}
        </h3>
        <div className="gold-line-left my-3" style={{ width: '2rem' }} />
        <p
          className="text-xs leading-relaxed mb-3 sm:mb-5 line-clamp-2 flex-1"
          style={{ color: 'var(--text-muted)', fontWeight: 400 }}
        >
          {product.description}
        </p>

        {/* Size selector */}
        <div className="mb-3 sm:mb-5">
          <p className="text-xs mb-2" style={{ color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Size
          </p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {product.product_variants
              .sort((a, b) => a.size_ml - b.size_ml)
              .map(variant => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariants(prev => ({ ...prev, [product.id]: variant.id }))}
                  disabled={variant.stock_quantity === 0}
                  className={`size-btn ${selectedVariants[product.id] === variant.id ? 'active' : ''}`}
                >
                  {variant.size_ml}ml
                </button>
              ))}
          </div>
        </div>

        {/* Price */}
        {selectedVariant && effectivePrice && (
          <div className="mb-3 sm:mb-5">
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span
                className="font-display text-xl sm:text-3xl"
                style={{ color: 'var(--gold)', fontWeight: 600 }}
              >
                R{effectivePrice.price.toFixed(2)}
              </span>
              {effectivePrice.isBulkPrice && (
                <span className="text-xs" style={{ color: 'var(--text-faint)', textDecoration: 'line-through' }}>
                  R{selectedVariant.regular_price.toFixed(2)}
                </span>
              )}
            </div>
            {customerType === 'reseller' && selectedVariant.bulk_price && !effectivePrice.isBulkPrice && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                Bulk: R{selectedVariant.bulk_price.toFixed(2)} (min {selectedVariant.bulk_min_quantity})
              </p>
            )}
          </div>
        )}

        {/* Add to Cart */}
        <button
          onClick={() => { addToCart(product); setIsCartOpen(true) }}
          disabled={isOutOfStock}
          className="btn-gold w-full text-center"
          style={{ opacity: isOutOfStock ? 0.4 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
        >
          <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  )
}
