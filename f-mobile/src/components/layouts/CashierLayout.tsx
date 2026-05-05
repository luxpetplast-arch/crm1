'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Clock, Users, LogOut, ChevronDown, ShoppingBag } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'

interface CashierLayoutProps {
  children: React.ReactNode
}

export default function CashierLayout({ children }: CashierLayoutProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [cashierName, setCashierName] = useState('Kassir')
  const [branchName, setBranchName] = useState('Filial')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('cashierName') || 'Kassir'
      const branch = localStorage.getItem('branchName') || 'Filial'
      setCashierName(name)
      setBranchName(branch)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('cashierToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('branchId')
    router.push('/')
  }

  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col shadow-2xl backdrop-blur-xl border-r border-[var(--border-primary)]" style={{ background: 'linear-gradient(to bottom, rgba(20, 184, 166, 0.2), var(--bg-primary))' }}>
        <div className="p-6 border-b border-[var(--border-primary)]">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">F-Mobile</h1>
          <p className="text-[var(--accent-secondary)] text-xs mt-1">Kassir Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/cashier/customers" className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group border border-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent-secondary)]">
            <Users size={20} className="group-hover:scale-110 transition-transform text-[var(--accent-secondary)]" />
            <span className="font-medium">Mijozlar</span>
          </Link>
          <Link href="/cashier/street-sale" className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group border border-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent-secondary)]">
            <ShoppingBag size={20} className="group-hover:scale-110 transition-transform text-[var(--accent-secondary)]" />
            <span className="font-medium">Ko'chaga Sotuv</span>
          </Link>
          <Link href="/cashier/history" className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group border border-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent-secondary)]">
            <Clock size={20} className="group-hover:scale-110 transition-transform text-[var(--accent-secondary)]" />
            <span className="font-medium">Savdo Tarixи</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-[var(--border-primary)]">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border border-transparent hover:bg-[var(--bg-hover)] hover:border-[var(--border-primary)]"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
              {cashierName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{cashierName}</p>
              <p className="text-xs text-[var(--accent-secondary)]">{branchName}</p>
            </div>
            <ChevronDown size={16} className={`transition-transform text-[var(--accent-secondary)] ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="mt-2 rounded-lg p-2 space-y-1 border border-[var(--border-primary)] backdrop-blur-sm" style={{ background: 'var(--bg-hover)' }}>
              <button className="w-full text-left px-4 py-2 rounded text-sm transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">
                Profil
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded text-sm flex items-center gap-2 transition-colors text-red-500 hover:text-red-400 hover:bg-red-500/10"
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col shadow-2xl z-50 backdrop-blur-xl border-r border-[var(--border-primary)]" style={{ background: 'linear-gradient(to bottom, rgba(20, 184, 166, 0.2), var(--bg-primary))' }}>
            <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">F-Mobile</h1>
                <p className="text-[var(--accent-secondary)] text-xs mt-1">Kassir Panel</p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-[var(--bg-hover)] rounded" title="Yopish">
                <X size={24} className="text-[var(--text-primary)]" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <Link href="/cashier/customers" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border border-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent-secondary)]">
                <Users size={20} className="text-[var(--accent-secondary)]" />
                <span className="font-medium">Mijozlar</span>
              </Link>
              <Link href="/cashier/street-sale" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border border-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent-secondary)]">
                <ShoppingBag size={20} className="text-[var(--accent-secondary)]" />
                <span className="font-medium">Ko'chaga Sotuv</span>
              </Link>
              <Link href="/cashier/history" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border border-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent-secondary)]">
                <Clock size={20} className="text-[var(--accent-secondary)]" />
                <span className="font-medium">Savdo Tarixи</span>
              </Link>
            </nav>

            <div className="p-4 border-t border-[var(--border-primary)]">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 text-white"
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
        <header className="border-b border-[var(--border-primary)] shadow-lg px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl" style={{ background: 'var(--bg-header)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-[var(--bg-hover)] rounded-lg transition"
              title="Menu"
            >
              <Menu size={24} className="text-[var(--accent-secondary)]" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">Kassir Panel</h2>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-3 md:px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition text-sm md:text-base font-medium border border-red-500/30 hover:border-red-500/50"
            >
              Chiqish
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 bg-[var(--bg-primary)]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
