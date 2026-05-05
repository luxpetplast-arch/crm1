'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export default function AdminLogin() {
  const router = useRouter()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!login || !password) {
        setError('Login va parolni kiriting')
        setLoading(false)
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      
      const response = await fetch(`${apiUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: login,
          password: password
        })
      })

      const data = await response.json()
      console.log('Login response:', { status: response.status, data })

      if (data.success && data.data?.token) {
        console.log('✓ Login successful, token:', data.data.token.substring(0, 20) + '...')
        localStorage.setItem('adminToken', data.data.token)
        localStorage.setItem('userRole', 'admin')
        localStorage.setItem('username', data.data.user.username)
        console.log('✓ Token saved to localStorage')
        console.log('Stored token:', localStorage.getItem('adminToken')?.substring(0, 20) + '...')
        router.push('/admin/dashboard')
      } else {
        console.error('Login failed:', data)
        setError(data.error || 'Login xatosi')
      }
    } catch (err) {
      setError('API bilan ulanishda xato')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse dark:bg-blue-600 dark:opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse dark:bg-purple-600 dark:opacity-10" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse dark:bg-cyan-600 dark:opacity-10" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-50 pointer-events-none"></div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="card-glass backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-2xl mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black text-[var(--text-primary)] mb-2">F-Mobile</h1>
            <p className="text-[var(--text-secondary)]">Admin Panel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Login */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[var(--text-secondary)]">
                Login
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="admin"
                  className="input-theme w-full pl-12 pr-4 py-3 rounded-xl"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[var(--text-secondary)]">
                Parol (ixtiyoriy)
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parol"
                  className="input-theme w-full pl-12 pr-12 py-3 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 badge-danger rounded-xl backdrop-blur-sm">
                <p className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl font-semibold transition-all duration-300 transform flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-blue-500/50 disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Kirish...
                </>
              ) : (
                <>
                  Kirish
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="btn-secondary w-full py-3 rounded-xl font-semibold transition-all"
            >
              ← Orqaga qaytish
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[var(--text-muted)] text-xs mt-8">
          F-Mobile v2.0.0 • © 2026
        </p>
      </div>
    </div>
  )
}

