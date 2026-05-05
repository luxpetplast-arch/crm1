'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Users, Store, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface AnalyticsData {
  salesByDay: Array<{ date: string; sales: number; transactions: number }>
  topProducts: Array<{ name: string; quantity: number; revenue: number }>
  salesByBranch: Array<{ name: string; sales: number; transactions: number }>
  salesByCashier: Array<{ name: string; sales: number; transactions: number }>
  totalStats: { totalRevenue: number; totalTransactions: number; averageTransaction: number }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalCashiers: 0,
    totalInventoryValueUSD: 0,
    totalInventoryValueUZS: 0,
    totalCustomers: 0,
  })
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/')
      } else {
        fetchDashboardData()
      }
    }
  }, [router, selectedDate])

  const formatPrice = (price: number): string => {
    return `${Math.floor(price).toLocaleString('uz-UZ')} so'm`
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const token = localStorage.getItem('adminToken')
      
      // Fetch all data using public endpoints
      const [branchesRes, cashiersRes, productsRes, customersRes, analyticsRes] = await Promise.all([
        fetch(`${apiUrl}/branches/public/all`),
        fetch(`${apiUrl}/cashiers/public/all`),
        fetch(`${apiUrl}/products/public/all`),
        fetch(`${apiUrl}/customers/public/all`),
        fetch(`${apiUrl}/analytics/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const branchesJson = await branchesRes.json()
      const cashiersJson = await cashiersRes.json()
      const productsJson = await productsRes.json()
      const customersJson = await customersRes.json()
      const analyticsJson = await analyticsRes.json()

      // Extract data arrays
      const branchesData = branchesJson.data || branchesJson || []
      const cashiersData = cashiersJson.data || cashiersJson || []
      const productsData = productsJson.data || productsJson || []
      const customersData = customersJson.data || customersJson || []

      // Calculate total inventory value - separate USD and UZS
      let totalInventoryValueUSD = 0
      let totalInventoryValueUZS = 0
      
      if (Array.isArray(productsData)) {
        productsData.forEach((product) => {
          let availableStock = product.stock || 0
          if (product.imeiList && product.imeiList.length > 0) {
            availableStock = product.imeiList.filter((item: any) => !item.used).length
          }
          
          const sellPrice = product.sellPrice || 0
          const currency = product.sellCurrency || product.currency || 'USD'
          
          if (currency === 'USD') {
            totalInventoryValueUSD += sellPrice * availableStock
          } else {
            totalInventoryValueUZS += sellPrice * availableStock
          }
        })
      }

      setStats({
        totalBranches: Array.isArray(branchesData) ? branchesData.length : 0,
        totalCashiers: Array.isArray(cashiersData) ? cashiersData.length : 0,
        totalInventoryValueUSD: totalInventoryValueUSD,
        totalInventoryValueUZS: totalInventoryValueUZS,
        totalCustomers: Array.isArray(customersData) ? customersData.length : 0,
      })

      if (analyticsJson.success) {
        setAnalytics(analyticsJson.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)] mx-auto mb-4"></div>
            <p className="text-[var(--text-muted)]">Ma'lumotlar yuklanimoqda...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="backdrop-blur-sm rounded-2xl p-8 border border-[var(--border-primary)]" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))' }}>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">Dashboard</h1>
            <p className="text-[var(--text-secondary)]">Xush kelibsiz, Admin! Tizimning umumiy ko'rinishi</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-glass rounded-2xl p-6 border-l-4 border-l-[var(--accent-primary)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Jami Filiallar</h3>
              <Store className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
            <p className="text-3xl font-black text-[var(--accent-primary)] mb-2">{stats.totalBranches}</p>
            <p className="text-xs text-[var(--text-muted)]">Faol filiallar</p>
          </div>

          <div className="card-glass rounded-2xl p-6 border-l-4 border-l-[var(--accent-success)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Jami Kassirlar</h3>
              <Users className="w-5 h-5 text-[var(--accent-success)]" />
            </div>
            <p className="text-3xl font-black text-[var(--accent-success)] mb-2">{stats.totalCashiers}</p>
            <p className="text-xs text-[var(--text-muted)]">Faol kassirlar</p>
          </div>

          <div className="card-glass rounded-2xl p-6 border-l-4 border-l-[var(--accent-warning)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Dollar Summa</h3>
              <DollarSign className="w-5 h-5 text-[var(--accent-warning)]" />
            </div>
            <p className="text-3xl font-black text-[var(--accent-warning)] mb-2">${stats.totalInventoryValueUSD.toFixed(2)}</p>
            <p className="text-xs text-[var(--text-muted)]">Barcha mahsulotlar</p>
          </div>

          <div className="card-glass rounded-2xl p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)]">So'm Summa</h3>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-black text-purple-500 mb-2">{formatPrice(stats.totalInventoryValueUZS)}</p>
            <p className="text-xs text-[var(--text-muted)]">Barcha mahsulotlar</p>
          </div>

          <div className="card-glass rounded-2xl p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Jami Mijozlar</h3>
              <Users className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-black text-red-500 mb-2">{stats.totalCustomers}</p>
            <p className="text-xs text-[var(--text-muted)]">Ro'yxatda</p>
          </div>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <>
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales by Day */}
              <div className="card-glass rounded-lg p-6">
                <h3 className="text-[var(--text-primary)] font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-[var(--accent-primary)]" />
                  Savdolar (Oxirgi 7 kun)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.salesByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="var(--accent-primary)" strokeWidth={2} dot={{ fill: 'var(--accent-primary)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top Products */}
              <div className="card-glass rounded-lg p-6">
                <h3 className="text-[var(--text-primary)] font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-[var(--accent-success)]" />
                  Top Mahsulotlar
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="revenue" fill="var(--accent-success)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sales by Branch */}
              <div className="card-glass rounded-lg p-6">
                <h3 className="text-[var(--text-primary)] font-semibold mb-4 flex items-center gap-2">
                  <Store size={18} className="text-[var(--accent-warning)]" />
                  Filiallar bo'yicha Savdolar
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.salesByBranch}
                      dataKey="sales"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={{ fill: 'var(--text-primary)' }}
                    >
                      {analytics.salesByBranch.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Sales by Cashier */}
              <div className="card-glass rounded-lg p-6">
                <h3 className="text-[var(--text-primary)] font-semibold mb-4 flex items-center gap-2">
                  <Users size={18} className="text-pink-500" />
                  Kassirlar bo'yicha Savdolar
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.salesByCashier} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                    <XAxis type="number" stroke="var(--text-muted)" />
                    <YAxis dataKey="name" type="category" stroke="var(--text-muted)" width={100} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="sales" fill="var(--accent-warning)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

