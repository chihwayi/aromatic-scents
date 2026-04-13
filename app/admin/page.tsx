'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Save, X, LogOut, User, Package, DollarSign, TrendingUp, Settings, ShoppingCart, CheckCircle2, BarChart3, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

interface ProductVariant {
  id?: string
  size_ml: number
  regular_price: number
  bulk_price: number
  bulk_min_quantity: number
  stock_quantity: number
}

interface Product {
  id?: string
  name: string
  description: string
  image_url: string
  is_new_arrival?: boolean
  product_variants?: ProductVariant[]
}

interface AdminStats {
  totalProducts: number
  totalVariants: number
  totalValue: number
  lowStockItems: number
}

interface OrderStats {
  total_orders: number
  paid_orders: number
  pending_orders: number
  failed_orders: number
  cancelled_orders: number
  total_revenue: number
  avg_order_value: number
  total_delivery_collected: number
  revenue_last_30_days: number
}

interface RecentOrder {
  id: string
  custom_payment_id: string
  customer_email: string
  total_amount: number
  paid_amount: number
  status: string
  payment_method: string
  include_delivery: boolean
  delivery_cost: number
  items: Array<{ name: string; size: number; quantity: number; price: number }>
  is_test: boolean
  created_at: string
}

interface AppSettings {
  delivery_cost: string
  bulk_discount_enabled: string
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<AppSettings>({
    delivery_cost: '50.00',
    bulk_discount_enabled: 'true'
  })
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    totalVariants: 0,
    totalValue: 0,
    lowStockItems: 0,
  })
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total_orders: 0,
    paid_orders: 0,
    pending_orders: 0,
    failed_orders: 0,
    cancelled_orders: 0,
    total_revenue: 0,
    avg_order_value: 0,
    total_delivery_collected: 0,
    revenue_last_30_days: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products'>('overview')
  const router = useRouter()

  const emptyProduct: Product = {
    name: '',
    description: '',
    image_url: '',
    is_new_arrival: false,
    product_variants: [
      { size_ml: 35, regular_price: 0, bulk_price: 0, bulk_min_quantity: 6, stock_quantity: 0 },
      { size_ml: 50, regular_price: 0, bulk_price: 0, bulk_min_quantity: 6, stock_quantity: 0 },
      { size_ml: 100, regular_price: 0, bulk_price: 0, bulk_min_quantity: 4, stock_quantity: 0 }
    ]
  }

  const calculateStats = useCallback((products: Product[]) => {
    const totalProducts = products.length
    let totalVariants = 0
    let totalValue = 0
    let lowStockItems = 0

    products.forEach(product => {
      if (product.product_variants) {
        totalVariants += product.product_variants.length
        product.product_variants.forEach(variant => {
          totalValue += variant.regular_price * variant.stock_quantity
          if (variant.stock_quantity < 5) {
            lowStockItems++
          }
        })
      }
    })

    setStats({ totalProducts, totalVariants, totalValue, lowStockItems })
  }, [])

  const fetchOrderStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('order_stats').select('*').maybeSingle()
      if (!error && data) {
        setOrderStats({
          total_orders: data.total_orders || 0,
          paid_orders: data.paid_orders || 0,
          pending_orders: data.pending_orders || 0,
          failed_orders: data.failed_orders || 0,
          cancelled_orders: data.cancelled_orders || 0,
          total_revenue: parseFloat(data.total_revenue) || 0,
          avg_order_value: parseFloat(data.avg_order_value) || 0,
          total_delivery_collected: parseFloat(data.total_delivery_collected) || 0,
          revenue_last_30_days: parseFloat(data.revenue_last_30_days) || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching order stats:', error)
    }
  }, [])

  const fetchRecentOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, custom_payment_id, customer_email, total_amount, paid_amount, status, payment_method, include_delivery, delivery_cost, items, is_test, created_at')
        .order('created_at', { ascending: false })
        .limit(25)
      if (!error && data) {
        setRecentOrders(data as RecentOrder[])
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error)
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
        calculateStats(data)
      } else {
        throw new Error('Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [calculateStats])

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/admin/login')
        return
      }

      const adminEmails = ['admin@aromaticscents.co.za', 'info@aromaticscents.co.za']
      if (!adminEmails.includes(session.user.email || '')) {
        await supabase.auth.signOut()
        router.push('/admin/login')
        return
      }

      setUser(session.user)
      await Promise.all([fetchProducts(), fetchSettings(), fetchOrderStats(), fetchRecentOrders()])
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin/login')
    }
  }, [router, fetchProducts, fetchSettings, fetchOrderStats, fetchRecentOrders])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const saveProduct = async (product: Product) => {
    try {
      const method = product.id ? 'PUT' : 'POST'
      const body = product.id 
        ? { id: product.id, product: { name: product.name, description: product.description, image_url: product.image_url, is_new_arrival: product.is_new_arrival }, variants: product.product_variants }
        : { product: { name: product.name, description: product.description, image_url: product.image_url, is_new_arrival: product.is_new_arrival }, variants: product.product_variants }

      const response = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Failed to save product')
      }

      fetchProducts()
      setEditingProduct(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product. Please try again.')
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product and all its variants?')) return

    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product. Please try again.')
    }
  }

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setSettings(newSettings)
      setShowSettings(false)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    }
  }

  const ProductForm = ({ product, onSave, onCancel }: {
    product: Product
    onSave: (product: Product) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState(product)

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.name) {
        alert('Please fill in the product name')
        return
      }
      
      // Validate that at least one variant has pricing
      const hasValidVariant = formData.product_variants?.some(v => v.regular_price > 0)
      if (!hasValidVariant) {
        alert('Please set prices for at least one bottle size')
        return
      }

      onSave(formData)
    }

    const updateVariant = (index: number, field: keyof ProductVariant, value: number) => {
      const updatedVariants = [...(formData.product_variants || [])]
      updatedVariants[index] = { ...updatedVariants[index], [field]: value }
      setFormData({ ...formData, product_variants: updatedVariants })
    }

    return (
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-rose-100/50 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_new_arrival || false}
              onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
              className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Mark as New Arrival
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            New arrivals will be displayed in a special section on the homepage
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bottle Sizes & Pricing</h3>
          <div className="space-y-4">
            {formData.product_variants?.map((variant, index) => (
              <div key={variant.size_ml} className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
                  <div className="text-sm font-medium text-gray-900">{variant.size_ml}ml</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Regular Price (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={variant.regular_price}
                    onChange={(e) => updateVariant(index, 'regular_price', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bulk Price (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={variant.bulk_price}
                    onChange={(e) => updateVariant(index, 'bulk_price', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Min Bulk Qty</label>
                  <input
                    type="number"
                    value={variant.bulk_min_quantity}
                    onChange={(e) => updateVariant(index, 'bulk_min_quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
                  <input
                    type="number"
                    value={variant.stock_quantity}
                    onChange={(e) => updateVariant(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Product
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300"
          >
            <X className="h-5 w-5 mr-2" />
            Cancel
          </button>
        </div>
      </form>
    )
  }

  const SettingsForm = () => {
    const [formSettings, setFormSettings] = useState(settings)

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      saveSettings(formSettings)
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Application Settings</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Cost (R)
              </label>
              <input
                type="number"
                step="0.01"
                value={formSettings.delivery_cost}
                onChange={(e) => setFormSettings({ ...formSettings, delivery_cost: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bulk Discount Enabled
              </label>
              <select
                value={formSettings.bulk_discount_enabled}
                onChange={(e) => setFormSettings({ ...formSettings, bulk_discount_enabled: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                Save Settings
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const statusBadge = (status: string) => {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    const map: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      complete: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600',
    }
    return (
      <span className={`${base} ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-2xl text-gray-600 font-light">Loading admin panel...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-sm border-b border-rose-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full mr-4 flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Aromatic Scents</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-rose-600 transition-colors duration-300"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <Link href="/" className="text-rose-600 hover:text-rose-700 font-medium transition-colors duration-300">
                View Store
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-red-600 transition-colors duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white/60 backdrop-blur-sm rounded-xl p-1 w-fit border border-rose-100/50 shadow-sm">
          {(['overview', 'orders', 'products'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow'
                  : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            {/* Revenue Stats */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-rose-500" /> Revenue & Orders
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100/50 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">R{orderStats.total_revenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-1">all time, paid orders only</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100/50 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-500">Last 30 Days</p>
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">R{orderStats.revenue_last_30_days.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-1">rolling 30-day window</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100/50 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">R{orderStats.avg_order_value.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-1">paid orders only</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100/50 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-500">Delivery Collected</p>
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">R{orderStats.total_delivery_collected.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-1">from paid deliveries</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100/50 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{orderStats.total_orders}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="text-green-600 font-medium">{orderStats.paid_orders} paid</span>
                    <span className="text-yellow-600 font-medium">{orderStats.pending_orders} pending</span>
                    <span className="text-red-500 font-medium">{orderStats.failed_orders} failed</span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100/50 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-500">Conversion</p>
                    <div className="w-10 h-10 bg-gradient-to-br from-lime-500 to-green-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {orderStats.total_orders > 0
                      ? Math.round((orderStats.paid_orders / orderStats.total_orders) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{orderStats.paid_orders} of {orderStats.total_orders} orders paid</p>
                </div>
              </div>
            </div>

            {/* Inventory Stats */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-rose-500" /> Inventory
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100/50 shadow-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Products</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100/50 shadow-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Variants</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalVariants}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100/50 shadow-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                      <p className="text-2xl font-bold text-gray-900">R{stats.totalValue.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100/50 shadow-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Low Stock</p>
                      <p className={`text-2xl font-bold ${stats.lowStockItems > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {stats.lowStockItems}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick recent orders preview */}
            {recentOrders.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50">
                <div className="px-8 py-5 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                  >
                    View all →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentOrders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-gray-600">{order.custom_payment_id}</td>
                          <td className="px-6 py-4 text-gray-700">{order.customer_email}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">R{(order.paid_amount || order.total_amount).toFixed(2)}</td>
                          <td className="px-6 py-4">{statusBadge(order.status)}</td>
                          <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString('en-ZA')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50">
            <div className="px-8 py-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">All Orders ({recentOrders.length})</h2>
              <button
                onClick={() => { fetchOrderStats(); fetchRecentOrders() }}
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-rose-600 border border-gray-200 rounded-lg hover:border-rose-300 transition-colors"
              >
                Refresh
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <ShoppingCart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <p className="text-lg">No orders yet</p>
                <p className="text-sm">Orders will appear here once customers complete payments.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/70">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order Ref</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((order) => {
                      const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0
                      const subtotal = order.total_amount - (order.include_delivery ? order.delivery_cost : 0)
                      return (
                        <tr key={order.id} className="hover:bg-rose-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {order.custom_payment_id}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700 max-w-[180px] truncate">{order.customer_email}</td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-gray-600 space-y-0.5">
                              {order.items?.slice(0, 2).map((item, i) => (
                                <div key={i}>{item.name} {item.size}ml ×{item.quantity}</div>
                              ))}
                              {(order.items?.length ?? 0) > 2 && (
                                <div className="text-gray-400">+{(order.items?.length ?? 0) - 2} more</div>
                              )}
                              <div className="text-gray-400">{itemCount} unit{itemCount !== 1 ? 's' : ''}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">R{subtotal.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            {order.include_delivery ? (
                              <span className="text-sky-600">R{order.delivery_cost.toFixed(2)}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            R{(order.paid_amount || order.total_amount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">{statusBadge(order.status)}</td>
                          <td className="px-6 py-4 text-gray-500 capitalize text-xs">
                            {order.payment_method ? order.payment_method.replace(/-/g, ' ') : '—'}
                          </td>
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                            {new Date(order.created_at).toLocaleDateString('en-ZA')}{' '}
                            <span className="text-xs text-gray-400">
                              {new Date(order.created_at).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === 'products' && (
          <>
            {!isAddingNew && !editingProduct && (
              <div className="mb-6">
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl hover:from-rose-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Product
                </button>
              </div>
            )}

            {isAddingNew && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Add New Product</h2>
                <ProductForm
                  product={emptyProduct}
                  onSave={saveProduct}
                  onCancel={() => setIsAddingNew(false)}
                />
              </div>
            )}

            {editingProduct && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Edit Product</h2>
                <ProductForm
                  product={editingProduct}
                  onSave={saveProduct}
                  onCancel={() => setEditingProduct(null)}
                />
              </div>
            )}

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50">
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Products ({products.length})</h2>
              </div>

              {products.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg">No products found</p>
                  <p className="text-sm">Add your first product to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <div key={product.id} className="p-8 hover:bg-gray-50/50 transition-colors duration-300">
                      <div className="flex items-start space-x-6">
                        <Image
                          src={product.image_url || 'https://via.placeholder.com/100'}
                          alt={product.name}
                          width={400}
                          height={400}
                          className="w-24 h-24 object-cover rounded-xl shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100'
                          }}
                        />

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                            {product.is_new_arrival && (
                              <span className="px-2 py-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs rounded-full font-medium">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">Available Sizes:</h4>
                            <div className="grid grid-cols-3 gap-3">
                              {product.product_variants?.map((variant) => (
                                <div key={variant.id} className="bg-gray-50 rounded-lg p-3 text-xs">
                                  <div className="font-medium text-gray-900">{variant.size_ml}ml</div>
                                  <div className="text-green-600">R{variant.regular_price.toFixed(2)}</div>
                                  {variant.bulk_price > 0 && (
                                    <div className="text-blue-600">Bulk: R{variant.bulk_price.toFixed(2)}</div>
                                  )}
                                  <div className={variant.stock_quantity < 5 ? 'text-red-600' : 'text-gray-600'}>
                                    Stock: {variant.stock_quantity}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id!)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsForm />}
    </div>
  )
}