'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Database, HardDrive, AlertCircle, CheckCircle } from 'lucide-react'

interface DatabaseStats {
  totalStorage: number
  usedStorage: number
  freeStorage: number
  usagePercent: number
  status: 'healthy' | 'warning' | 'critical'
}

export default function DatabasePage() {
  const router = useRouter()
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDatabaseStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('adminToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      
      const response = await fetch(`${apiUrl}/database/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error || 'Ma\'lumot yuklashda xato')
      }
    } catch (err) {
      setError('API bilan ulanishda xato')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/')
      } else {
        fetchDatabaseStats()
        // Refresh every 30 seconds
        const interval = setInterval(fetchDatabaseStats, 30000)
        return () => clearInterval(interval)
      }
    }
  }, [router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'from-green-600/20 to-emerald-600/20'
      case 'warning':
        return 'from-yellow-600/20 to-orange-600/20'
      case 'critical':
        return 'from-red-600/20 to-rose-600/20'
      default:
        return 'from-blue-600/20 to-cyan-600/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-6 h-6 text-green-400" />
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-400" />
      case 'critical':
        return <AlertCircle className="w-6 h-6 text-red-400" />
      default:
        return <Database className="w-6 h-6 text-blue-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Sog\'lom'
      case 'warning':
        return 'Ogohlantirish'
      case 'critical':
        return 'Kritik'
      default:
        return 'Noma\'lum'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Database</h1>
          <p className="text-gray-300 mt-1">Saqlash joyini monitoring qiling</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-slate-800/50 rounded-2xl p-12 text-center border border-slate-700/50">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Ma\'lumot yuklanimoqda...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Stats */}
        {stats && !loading && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`bg-gradient-to-br ${getStatusColor(stats.status)} backdrop-blur-xl rounded-2xl p-8 border border-white/10`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Database Holati</h2>
                  <p className="text-gray-300">MongoDB Atlas Storage</p>
                </div>
                {getStatusIcon(stats.status)}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-black text-white">{stats.usagePercent}%</div>
                <div className="text-sm text-gray-300">
                  <p>{getStatusText(stats.status)}</p>
                  <p className="mt-1">{stats.usedStorage} MB / {stats.totalStorage} MB</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-white">Saqlash Joyining Foydalanilishi</h3>
                  <span className="text-sm text-gray-400">{stats.usedStorage} MB</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden border border-white/20">
                  <div
                    className={`h-full transition-all duration-500 ${
                      stats.status === 'critical'
                        ? 'bg-gradient-to-r from-red-500 to-rose-500'
                        : stats.status === 'warning'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}
                    style={{ width: `${stats.usagePercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Storage Breakdown */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <HardDrive className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">Foydalanilgan</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{stats.usedStorage} MB</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <HardDrive className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-400">Bo\'sh</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{stats.freeStorage} MB</p>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-3">Jami Saqlash Joyi</h3>
                <p className="text-3xl font-black text-cyan-400">{stats.totalStorage} MB</p>
                <p className="text-sm text-gray-400 mt-2">MongoDB Atlas Free Tier</p>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-3">Foydalanilish Darajasi</h3>
                <p className="text-3xl font-black text-blue-400">{stats.usagePercent}%</p>
                <p className="text-sm text-gray-400 mt-2">
                  {stats.status === 'critical' && 'Kritik darajada - Tozalash tavsiya etiladi'}
                  {stats.status === 'warning' && 'Ogohlantirish - Kuzatib boring'}
                  {stats.status === 'healthy' && 'Sog\'lom - Hech qanday muammo yo\'q'}
                </p>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchDatabaseStats}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30 font-semibold"
            >
              Yangilash
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
