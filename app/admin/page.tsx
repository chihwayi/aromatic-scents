'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Save, X, LogOut, User, Package, DollarSign, TrendingUp, Settings } from 'lucide-react'
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
  product_variants?: ProductVariant[]
}

interface AdminStats {
  totalProducts: number
  totalVariants: number
  totalValue: number
  lowStockItems: number
  recentOrders: number
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
    recentOrders: 0
  })
  const router = useRouter()

  const emptyProduct: Product = {
    name: '',
    description: '',
    image_url: '',
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

    const recentOrders = 0 // This would need to be fetched from orders table

    setStats({
      totalProducts,
      totalVariants,
      totalValue,
      lowStockItems,
      recentOrders
    })
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
      await Promise.all([fetchProducts(), fetchSettings()])
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin/login')
    }
  }, [router, fetchProducts, fetchSettings])

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
        ? { id: product.id, product: { name: product.name, description: product.description, image_url: product.image_url }, variants: product.product_variants }
        : { product: { name: product.name, description: product.description, image_url: product.image_url }, variants: product.product_variants }

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

  // Custom image component to handle external URLs
  const ProductImage = ({ src, alt, className }: { src: string, alt: string, className: string }) => {
    const [imgSrc, setImgSrc] = useState(src || 'https://via.placeholder.com/100')
    const [hasError, setHasError] = useState(false)

    const handleError = () => {
      if (!hasError) {
        setHasError(true)
        setImgSrc('https://via.placeholder.com/100')
      }
    }

    // For external images, use regular img tag with proper error handling
    if (src && (src.startsWith('http') || src.startsWith('https'))) {
      return (
        <img
          src={imgSrc}
          alt={alt}
          className={className}
          onError={handleError}
          crossOrigin="anonymous"
          style={{ objectFit: 'cover' }}
        />
      )
    }

    // For relative URLs or known domains, use Next.js Image
    return (
      <Image
        src={imgSrc}
        alt={alt}
        width={96}
        height={96}
        className={className}
        onError={handleError}
        style={{ objectFit: 'cover' }}
      />
    )
  }

  const ProductForm = ({ product, onSave, onCancel }: {
    product: Product
    onSave: (product: Product) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState(product)
    const [imagePreview, setImagePreview] = useState(product.image_url)

    const handleImageUrlChange = (url: string) => {
      setFormData({ ...formData, image_url: url })
      setImagePreview(url)
    }

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
            onChange={(e) => handleImageUrlChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
            placeholder="https://example.com/image.jpg"
          />
          {imagePreview && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className="w-32 h-32 border border-gray-300 rounded-xl overflow-hidden">
                <ProductImage
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
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
                <p className="text-sm text-gray-600">Manage your perfume store</p>
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
              <Link
                href="/"
                className="text-rose-600 hover:text-rose-700 font-medium transition-colors duration-300"
              >
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100/50 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
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
                <p className="text-2xl font-bold text-gray-900">R{stats.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100/50 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Variants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100/50 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Product Variants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVariants}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Product Button */}
        {!isAddingNew && !editingProduct && (
          <div className="mb-8">
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center px-8 py-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl hover:from-rose-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Product
            </button>
          </div>
        )}

        {/* Add New Product Form */}
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

        {/* Edit Product Form */}
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

        {/* Products List */}
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
                    <div className="w-24 h-24 rounded-xl shadow-md overflow-hidden bg-gray-100">
                      <ProductImage
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      
                      {/* Product Variants */}
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
                              <div className={`${variant.stock_quantity < 5 ? 'text-red-600' : 'text-gray-600'}`}>
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
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsForm />}
    </div>
  )
}