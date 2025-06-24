'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Save, X, LogOut, User, Package, DollarSign, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link' 
import Image from 'next/image'

interface Product {
  id?: string
  name: string
  description: string
  price: number
  image_url: string
  stock_quantity: number
}

interface AdminStats {
  totalProducts: number
  totalValue: number
  lowStockItems: number
  recentOrders: number
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    recentOrders: 0
  })
  const router = useRouter()

  const emptyProduct: Product = {
    name: '',
    description: '',
    price: 0,
    image_url: '',
    stock_quantity: 0
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/admin/login')
        return
      }

      // Check if user is admin
      const adminEmails = ['admin@aromaticscents.co.za', 'info@aromaticscents.co.za']
      if (!adminEmails.includes(session.user.email || '')) {
        await supabase.auth.signOut()
        router.push('/admin/login')
        return
      }

      setUser(session.user)
      await fetchProducts()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin/login')
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      const products = data || []
      setProducts(products)
      
      // Calculate stats
      const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0)
      const lowStockItems = products.filter(p => p.stock_quantity < 5).length
      
      setStats({
        totalProducts: products.length,
        totalValue,
        lowStockItems,
        recentOrders: 0 // You can implement this based on your orders table
      })
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

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
      if (product.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: product.image_url,
            stock_quantity: product.stock_quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id)
        
        if (error) throw error
      } else {
        // Add new product
        const { error } = await supabase
          .from('products')
          .insert([{
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: product.image_url,
            stock_quantity: product.stock_quantity
          }])
        
        if (error) throw error
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
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product. Please try again.')
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
      if (!formData.name || !formData.price) {
        alert('Please fill in all required fields')
        return
      }
      onSave(formData)
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

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (R) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
            />
          </div>
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
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
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
                <p className="text-sm font-medium text-gray-600">Recent Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentOrders}</p>
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
                  <div className="flex items-center space-x-6">
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
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex space-x-6 text-sm">
                        <span className="flex items-center text-green-600 font-medium">
                          R{product.price.toFixed(2)}
                        </span>
                        <span className={`flex items-center font-medium ${
                          product.stock_quantity < 5 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          <Package className="h-4 w-4 mr-1" />
                          {product.stock_quantity} in stock
                        </span>
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
    </div>
  )
}