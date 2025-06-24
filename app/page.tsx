'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Plus, Minus, Facebook, Instagram, Twitter, Mail, Phone, MapPin, Heart, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { loadStripe } from '@stripe/stripe-js'
import Image from 'next/image'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock_quantity: number
}

interface CartItem extends Product {
  quantity: number
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock_quantity', 0)

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, change: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change
          return newQuantity <= 0
            ? null
            : { ...item, quantity: newQuantity }
        }
        return item
      }).filter(Boolean) as CartItem[]
    })
  }

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleCheckout = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
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
              Discover our curated collection of premium perfumes, crafted for those who appreciate the art of scent. 
              Each fragrance tells a unique story of elegance and sophistication.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-100/50">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Premium Quality</h3>
              <p className="text-gray-600 text-sm">Handcrafted with the finest ingredients</p>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-100/50">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Exclusive Collection</h3>
              <p className="text-gray-600 text-sm">Unique scents you won&apos;t find elsewhere</p>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-100/50">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Quick and secure shipping worldwide</p>
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
            {products.map((product) => (
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
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-light text-rose-600">
                        R{product.price.toFixed(2)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {product.stock_quantity} in stock
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-gradient-to-r from-rose-500 to-amber-500 text-white px-8 py-3 rounded-full hover:from-rose-600 hover:to-amber-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                  <span className="text-sm">+27 123 456 789</span>
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

            <div className="flex-1 overflow-y-auto p-6" style={{ height: 'calc(100vh - 200px)' }}>
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400 mt-2">Add some fragrances to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={400}
                        height={400}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-rose-600 font-semibold">R{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
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
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold text-gray-800">Total:</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                    R{getTotalPrice().toFixed(2)}
                  </span>
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