'use client'

import { useRouter } from 'next/navigation'
import { Lock, Store, Building2, BarChart3, Users, FileText } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export default function Home() {
  const router = useRouter()

  const features = [
    {
      icon: Building2,
      title: 'Multi-Filial',
      description: 'Barcha filiallarni bitta platformada boshqarish'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Kunlik, haftalik, oylik hisobotlar'
    },
    {
      icon: Users,
      title: 'Kassir Boshqaruvi',
      description: 'Kassirlarni tayinlash va monitoring'
    },
    {
      icon: FileText,
      title: 'Advanced Reports',
      description: 'Chuqur tahlil va statistika'
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse dark:bg-blue-600 dark:opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse dark:bg-purple-600 dark:opacity-10" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse dark:bg-pink-600 dark:opacity-10" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-50 pointer-events-none"></div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Features */}
          <div>
            <h1 className="text-5xl font-black text-[var(--text-primary)] mb-3">F-Mobile</h1>
            <p className="text-[var(--text-secondary)] text-lg mb-8">Professional Do'kon Boshqaruv Tizimi</p>

            <div className="space-y-4">
              {features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div key={idx} className="flex gap-4 group">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 group-hover:bg-[var(--accent-primary)]/20 transition-all">
                        <Icon className="h-6 w-6 text-[var(--accent-primary)]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[var(--text-primary)] font-semibold">{feature.title}</h3>
                      <p className="text-[var(--text-secondary)] text-sm">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right - Login Options */}
          <div className="card-glass backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Xush Kelibsiz</h2>
              <p className="text-[var(--text-secondary)]">Tizimga kirish uchun rol nomi tanglang</p>
            </div>

            <div className="space-y-4">
              {/* Admin Login */}
              <button
                onClick={() => router.push('/admin/login')}
                className="w-full group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl p-4 transition-all hover:shadow-lg border border-blue-500/30 hover:border-blue-500/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold">Admin Panel</h3>
                    <p className="text-blue-100 text-sm">Tizimni boshqarish</p>
                  </div>
                  <div className="text-white group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </button>

              {/* Cassier Login */}
              <button
                onClick={() => router.push('/cashier/login')}
                className="w-full group bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-xl p-4 transition-all hover:shadow-lg border border-teal-500/30 hover:border-teal-500/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold">Kassir Panel</h3>
                    <p className="text-teal-100 text-sm">Savdo qilish</p>
                  </div>
                  <div className="text-white group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-[var(--border-primary)]">
              <p className="text-[var(--text-muted)] text-xs text-center">F-Mobile v2.0.0 • Production Ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

