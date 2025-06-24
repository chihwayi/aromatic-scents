'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setError(error.message)
            } else {
                // Check if the authenticated user is an admin
                const adminEmails = ['admin@aromaticscents.co.za', 'info@aromaticscents.co.za']
                const { data: { user } } = await supabase.auth.getUser()

                if (user && adminEmails.includes(user.email || '')) {
                    router.push('/admin') // Redirect to admin panel on successful admin login
                } else {
                    setError('You are not authorized to access the admin panel.')
                    await supabase.auth.signOut() // Sign out non-admin users
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
                console.error('Login error:', err)
            } else {
                setError('An unexpected error occurred.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-rose-100/50 w-full max-w-md">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Admin Login</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                            required
                        />
                    </div>
                    {error && (
                        <p className="text-red-600 text-sm text-center">{error}</p>
                    )}
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl hover:from-rose-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    <Link href="/" className="font-medium text-rose-600 hover:text-rose-700">
                        Back to store
                    </Link>
                </p>
            </div>
        </div>
    )
}