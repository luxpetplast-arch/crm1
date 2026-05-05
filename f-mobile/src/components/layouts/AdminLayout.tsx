'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu,
  X,
  LayoutDashboard,
  Store,
  Users,
  ShoppingCart,
  LogOut,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Database,
} from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('userRole')
    router.push('/')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Store, label: 'Asosiy Ombor', href: '/admin/main-warehouse' },
    { icon: Store, label: 'Ombor', href: '/admin/inventory' },
    { icon: Store, label: 'Filiallar', href: '/admin/branches' },
    { icon: Users, label: 'Kassirlar', href: '/admin/cashiers' },
    { icon: Users, label: 'Mijozlar', href: '/admin/customers' },
    { icon: ShoppingCart, label: 'Savdolar', href: '/admin/sales' },
    { icon: DollarSign, label: 'Kassa', href: '/admin/cashier-register' },
    { icon: TrendingDown, label: 'Qarzdorlar', href: '/admin/debtors' },
    { icon: DollarSign, label: 'Dollar Kursi', href: '/admin/exchange-rate' },
    { icon: Database, label: 'Database', href: '/admin/database' },
  ]

  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col shadow-2xl border-r border-[var(--border-primary)]" style={{ background: 'var(--bg-sidebar)' }}>
        {/* Logo */}
        <div className="p-6 border-b border-[var(--border-primary)] backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">F-Mobile</h1>
          </div>
          <p className="text-[var(--accent-primary)] text-xs mt-1 ml-13">Admin Panel</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border border-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-primary)]"
              >
                <Icon size={20} className="group-hover:scale-110 transition-transform text-[var(--accent-primary)] group-hover:text-[var(--accent-secondary)]" />
                <span className="font-medium group-hover:text-[var(--accent-secondary)]">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[var(--border-primary)] backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(6, 182, 212, 0.05))' }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border border-transparent hover:bg-[var(--bg-hover)] hover:border-[var(--border-primary)]"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
              A
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Admin</p>
              <p className="text-xs text-[var(--accent-primary)]">Administrator</p>
            </div>
            <ChevronDown size={16} className={`transition-transform text-[var(--accent-primary)] ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="mt-2 rounded-xl p-2 space-y-1 border border-[var(--border-primary)] animate-in fade-in" style={{ background: 'var(--bg-hover)' }}>
              <button className="w-full text-left px-4 py-2 rounded-lg text-sm transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">
                Profil
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors text-red-500 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut size={16} />
                Chiqish
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col shadow-2xl z-50 border-r border-[var(--border-primary)]" style={{ background: 'var(--bg-sidebar)' }}>
            {/* Logo */}
            <div className="p-6 border-b border-[var(--border-primary)] backdrop-blur-sm flex justify-between items-center" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))' }}>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">F</span>
                  </div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">F-Mobile</h1>
                </div>
                <p className="text-[var(--accent-primary)] text-xs mt-1 ml-13">Admin Panel</p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-[var(--bg-hover)] rounded-lg transition" title="Yopish">
                <X size={24} className="text-[var(--text-primary)]" />
              </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border border-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-primary)]"
                  >
                    <Icon size={20} className="text-[var(--accent-primary)]" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-[var(--border-primary)]">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 text-white shadow-lg"
              >
                <LogOut size={16} />
                Chiqish
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="backdrop-blur-xl px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30 border-b border-[var(--border-primary)] shadow-lg" style={{ background: 'var(--bg-header)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-[var(--bg-hover)] rounded-lg transition text-[var(--accent-primary)]"
              title="Menu"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Admin Panel</h2>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-3 md:px-4 py-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition text-sm md:text-base font-medium border border-red-500/30 hover:border-red-500/50"
            >
              Chiqish
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-[var(--bg-primary)]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
