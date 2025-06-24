'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Plus, Minus, Facebook, Instagram, Twitter, Mail, Phone, MapPin, Heart, Star, MessageCircle, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { loadStripe } from '@stripe/stripe-js'
import Image from 'next/image'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: string}>({})
  const [customerType, setCustomerType] = useState<'regular' | 'reseller'>('regular')
  const [includeDelivery, setIncludeDelivery] = useState(false)
  const [settings, setSettings] = useState<Settings>({ delivery_cost: '50.00', bulk_discount_enabled: 'true' })

  // Phone number for WhatsApp and calls
  const phoneNumber = '263738649300'
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hi! I'm interested in your perfume collection.`
  const callUrl = `tel:+${phoneNumber}`

  useEffect(() => {
    fetchProducts()
    fetchSettings()
  }, [])

  const fetchProducts = async () => {
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
      
      // Filter products that have at least one variant with stock
      const productsWithStock = (data || []).filter(product => 
        product.product_variants.some((variant: ProductVariant) => variant.stock_quantity > 0)
      )
      
      setProducts(productsWithStock)
      
      // Initialize selected variants (default to first available variant for each product)
      const initialSelection: {[key: string]: string} = {}
      productsWithStock.forEach(product => {
        const availableVariant = product.product_variants.find((v: ProductVariant) => v.stock_quantity > 0)
        if (availableVariant) {
          initialSelection[product.id] = availableVariant.id
        }
      })
      setSelectedVariants(initialSelection)
      
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')

      if (error) throw error

      const settingsObj = data.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value
        return acc
      }, {})

      setSettings(settingsObj)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const getSelectedVariant = (product: Product): ProductVariant | null => {
    const selectedVariantId = selectedVariants[product.id]
    return product.product_variants.find(v => v.id === selectedVariantId) || null
  }

  const getEffectivePrice = (variant: ProductVariant, quantity: number): { price: number; isBulkPrice: boolean } => {
    const isBulkEligible = customerType === 'reseller' && 
                          variant.bulk_price && 
                          quantity >= variant.bulk_min_quantity &&
                          settings.bulk_discount_enabled === 'true'
    
    return {
      price: isBulkEligible ? variant.bulk_price! : variant.regular_price,
      isBulkPrice: !!isBulkEligible
    }
  }

  const addToCart = (product: Product) => {
    const selectedVariant = getSelectedVariant(product)
    if (!selectedVariant) return

    const { price, isBulkPrice } = getEffectivePrice(selectedVariant, 1)

    setCart(prev => {
      const existing = prev.find(item => item.variantId === selectedVariant.id)
      if (existing) {
        const newQuantity = existing.quantity + 1
        const { price: newPrice, isBulkPrice: newIsBulkPrice } = getEffectivePrice(selectedVariant, newQuantity)
        
        return prev.map(item =>
          item.variantId === selectedVariant.id
            ? { ...item, quantity: newQuantity, price: newPrice, isBulkPrice: newIsBulkPrice }
            : item
        )
      }
      
      return [...prev, {
        variantId: selectedVariant.id,
        productId: product.id,
        name: product.name,
        size: selectedVariant.size_ml,
        price,
        quantity: 1,
        isBulkPrice,
        image_url: product.image_url
      }]
    })
  }

  const updateQuantity = (variantId: string, change: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.variantId === variantId) {
          const newQuantity = item.quantity + change
          if (newQuantity <= 0) return null
          
          // Find the variant to recalculate pricing
          const product = products.find(p => p.id === item.productId)
          const variant = product?.product_variants.find(v => v.id === variantId)
          
          if (variant) {
            const { price, isBulkPrice } = getEffectivePrice(variant, newQuantity)
            return { ...item, quantity: newQuantity, price, isBulkPrice }
          }
          
          return { ...item, quantity: newQuantity }
        }
        return item
      }).filter(Boolean) as CartItem[]
    })
  }

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId))
  }

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getDeliveryCost = () => {
    return includeDelivery ? parseFloat(settings.delivery_cost || '0') : 0
  }

  const getTotalPrice = () => {
    return getSubtotal() + getDeliveryCost()
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return

    try {
      setLoading(true)
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            variantId: item.variantId,
            name: item.name,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
            isBulkPrice: item.isBulkPrice
          })),
          includeDelivery,
          customerType
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: sessionId
        })
        if (error) {
          console.error('Stripe error:', error)
          alert('Payment failed. Please try again.')
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-2xl text-gray-600 font-light">Loading our collection...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-rose-100/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full mr-3 flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-3xl font-light bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                Aromatic Scents
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Customer Type Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Customer Type:</span>
                <button
                  onClick={() => setCustomerType(customerType === 'regular' ? 'reseller' : 'regular')}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                    customerType === 'reseller'
                      ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {customerType === 'reseller' ? 'Reseller' : 'Regular'}
                </button>
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 text-gray-700 hover:text-rose-600 transition-all duration-300 hover:bg-rose-50 rounded-full"
              >
                <ShoppingBag className="h-7 w-7" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium animate-pulse">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-100/30 to-amber-100/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="flex justify-center space-x-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-amber-400 fill-current" />
              ))}
            </div>
            <h2 className="text-6xl md:text-7xl font-light text-gray-800 mb-6 leading-tight">
              Exquisite
              <span className="block bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent font-medium">
                Fragrances
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover our curated collection of premium perfumes, available in 35ml, 50ml, and 100ml bottles. 
              Each fragrance tells a unique story of elegance and sophistication.
            </p>
            {customerType === 'reseller' && settings.bulk_discount_enabled === 'true' && (
              <div className="bg-gradient-to-r from-rose-100 to-amber-100 border border-rose-200 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-rose-700 font-medium">
                  🎉 Reseller pricing active! Enjoy bulk discounts on qualifying quantities.
                </p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-100/50">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Multiple Sizes</h3>
              <p className="text-gray-600 text-sm">Available in 35ml, 50ml, and 100ml bottles</p>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-100/50">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Bulk Discounts</h3>
              <p className="text-gray-600 text-sm">Special pricing for resellers and bulk orders</p>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-100/50">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Optional delivery service available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-light text-gray-800 mb-4">Our Collection</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-rose-500 to-amber-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product) => {
              const selectedVariant = getSelectedVariant(product)
              const effectivePrice = selectedVariant ? getEffectivePrice(selectedVariant, 1) : null
              
              return (
                <div
                  key={product.id}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-rose-100/50 hover:border-rose-200/50"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300"
                    >
                      <Heart 
                        className={`h-5 w-5 transition-colors ${
                          favorites.includes(product.id) 
                            ? 'text-rose-500 fill-current' 
                            : 'text-gray-400 hover:text-rose-500'
                        }`} 
                      />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-light text-gray-800 mb-3">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                    
                    {/* Size Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Size:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.product_variants
                          .sort((a, b) => a.size_ml - b.size_ml)
                          .map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => setSelectedVariants(prev => ({
                              ...prev,
                              [product.id]: variant.id
                            }))}
                            disabled={variant.stock_quantity === 0}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                              selectedVariants[product.id] === variant.id
                                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg'
                                : variant.stock_quantity > 0
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {variant.size_ml}ml
                            {variant.stock_quantity === 0 && ' (Out of Stock)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pricing and Stock Info */}
                    {selectedVariant && effectivePrice && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-3xl font-light text-rose-600">
                              R{effectivePrice.price.toFixed(2)}
                            </span>
                            {effectivePrice.isBulkPrice && (
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                Bulk Price
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Show regular price if bulk price is active */}
                        {effectivePrice.isBulkPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            Regular: R{selectedVariant.regular_price.toFixed(2)}
                          </div>
                        )}
                        
                        {/* Show bulk pricing info for resellers */}
                        {customerType === 'reseller' && selectedVariant.bulk_price && !effectivePrice.isBulkPrice && (
                          <div className="text-sm text-green-600 mt-1">
                            Bulk price: R{selectedVariant.bulk_price.toFixed(2)} (min {selectedVariant.bulk_min_quantity} items)
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-500">
                            {selectedVariant.stock_quantity} in stock
                          </div>
                          {selectedVariant.stock_quantity <= 5 && selectedVariant.stock_quantity > 0 && (
                            <div className="text-xs text-orange-600 font-medium">
                              Only {selectedVariant.stock_quantity} left
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => addToCart(product)}
                      disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                      className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white px-8 py-3 rounded-full hover:from-rose-600 hover:to-amber-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {!selectedVariant || selectedVariant.stock_quantity === 0 
                        ? 'Out of Stock' 
                        : 'Add to Cart'
                      }
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-rose-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full mr-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <h3 className="text-3xl font-light">Aromatic Scents</h3>
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed max-w-md">
                Where passion meets perfection. We curate the world&apos;s finest fragrances to bring you an unparalleled 
                olfactory experience that defines your unique style and personality.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-gray-300">
                <li><a href="#" className="hover:text-rose-400 transition-colors duration-300">About Us</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors duration-300">Our Story</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors duration-300">Gift Cards</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors duration-300">Fragrance Guide</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors duration-300">Reviews</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Get In Touch</h4>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-rose-400" />
                  <span className="text-sm">123 Fragrance Ave<br />Pretoria, South Africa</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-rose-400" />
                  <span className="text-sm">+263 778 886 413</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-rose-400" />
                  <span className="text-sm">info@aromaticscents.co.za</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 Aromatic Scents. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-rose-400 transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="hover:text-rose-400 transition-colors duration-300">Terms of Service</a>
                <a href="#" className="hover:text-rose-400 transition-colors duration-300">Shipping Info</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-4 z-50">
        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-110"
        >
          <MessageCircle className="h-7 w-7 text-white" />
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Chat on WhatsApp
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
          </div>
        </a>

        {/* Call Button */}
        <a
          href={callUrl}
          className="group relative w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-110"
        >
          <Phone className="h-7 w-7 text-white" />
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Call us now
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
          </div>
        </a>
      </div>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
            <div className="p-6 border-b bg-gradient-to-r from-rose-50 to-amber-50">
              <h3 className="text-xl font-semibold text-gray-800">Shopping Cart</h3>
              <p className="text-sm text-gray-600 mt-1">
                {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6" style={{ height: 'calc(100vh - 280px)' }}>
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400 mt-2">Add some fragrances to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.variantId} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={400}
                        height={400}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <div className="text-sm text-gray-500">{item.size}ml</div>
                        <div className="flex items-center space-x-2">
                          <span className="text-rose-600 font-semibold">R{item.price.toFixed(2)}</span>
                          {item.isBulkPrice && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Bulk
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.variantId, -1)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, 1)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t p-6 bg-gradient-to-r from-rose-50 to-amber-50">
                {/* Delivery Option */}
                <div className="mb-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDelivery}
                      onChange={(e) => setIncludeDelivery(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                    />
                    <span className="text-sm text-gray-700">
                      Include delivery (R{parseFloat(settings.delivery_cost || '0').toFixed(2)})
                    </span>
                  </label>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">R{getSubtotal().toFixed(2)}</span>
                  </div>
                  {includeDelivery && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium">R{getDeliveryCost().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Total:</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                        R{getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white py-4 rounded-xl font-medium hover:from-rose-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}