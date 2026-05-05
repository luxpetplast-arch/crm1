'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CashierLayout from '@/components/layouts/CashierLayout'
import { Search, ChevronDown, Trash2 } from 'lucide-react'
import { getSales, deleteSale } from '@/lib/api'

interface PaymentMethod {
  type: 'cash' | 'debt' | 'click' | 'terminal'
  amount: number
}

interface Sale {
  id?: string
  _id?: string
  customer?: { name: string }
  cashier?: { name: string; username: string }
  branch?: { name: string; id: string }
  totalAmount: number
  paidAmount: number
  paymentMethods?: PaymentMethod[]
  items: Array<{ product?: { name: string }; quantity: number; imei?: string; currency?: 'USD' | 'UZS' }>
  createdAt: string
  notes?: string
  currency?: 'USD' | 'UZS'
}

export default function HistoryPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sales, setSales] = useState<Sale[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const formatPrice = (price?: number, currency?: 'USD' | 'UZS'): string => {
    if (!price || isNaN(price)) return '0'
    
    // Determine currency from sale items if not provided
    if (currency === 'USD') {
      return `$${price.toFixed(2)}`
    } else {
      // UZS or default
      return `${Math.floor(price).toLocaleString('uz-UZ')} so'm`
    }
  }

  const fetchSales = async () => {
    setError(null)
    const response = await getSales()
    if (response.success && response.data) {
      setSales(response.data as Sale[])
    } else {
      setError(response.error || 'Savdolarni yuklashda xato')
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cashierToken')
      if (!token) {
        router.push('/')
      } else {
        fetchSales()
      }
    }
  }, [router])

  const filteredSales = sales.filter((sale) => {
    return (
      (sale.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.items.some(item => (item.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  const handleDeleteSale = async (saleId: string) => {
    if (!confirm('Ushbu savdoni o\'chirishni tasdiqlaysizmi?')) return

    setIsDeleting(saleId)
    setError(null)

    const response = await deleteSale(saleId)

    if (response.success) {
      setSales(sales.filter(s => (s._id || s.id) !== saleId))
    } else {
      setError(response.error || 'Savdoni o\'chirishda xato')
    }

    setIsDeleting(null)
  }

  const toggleExpanded = (saleId: string) => {
    const newExpandedIds = new Set(expandedIds)
    if (newExpandedIds.has(saleId)) {
      newExpandedIds.delete(saleId)
    } else {
      newExpandedIds.add(saleId)
    }
    setExpandedIds(newExpandedIds)
  }

  return (
    <CashierLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">Savdo Tarixi</h1>
          <p className="text-gray-400 mt-1">O'tgan savdo tranzaksiyalari</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="card-glass p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-teal-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Mijoz yoki mahsulot qidirish..."
              className="input-glass w-full pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="space-y-2 p-4">
            {filteredSales.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Savdolar topilmadi</p>
              </div>
            ) : (
              filteredSales.map((sale, index) => {
                const saleId = sale._id || sale.id || `sale-${index}`;
                const isExpanded = expandedIds.has(saleId);
                return (
                <div key={saleId} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                  {/* Main Row */}
                  <button
                    onClick={() => toggleExpanded(saleId)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/10 transition text-left"
                  >
                    <div className="flex-1 grid grid-cols-6 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Sana va Vaqt</p>
                        <p className="text-white font-semibold">{new Date(sale.createdAt).toLocaleString('uz-UZ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Mijoz Ismi</p>
                        <p className="text-white font-semibold">
                          {sale.customer?.name 
                            ? sale.customer.name 
                            : (sale as any).notes === "Ko'chaga sotuv" || (sale as any).saleType === 'street'
                              ? "Ko'chaga sotuv"
                              : "Noma'lum"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Kassir</p>
                        <p className="text-white font-semibold">
                          {sale.cashier?.name || sale.cashier?.username || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Filial</p>
                        <p className="text-white font-semibold">{sale.branch?.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Miqdor</p>
                        <p className="text-white font-semibold">{sale.items.reduce((sum, item) => sum + item.quantity, 0)} ta</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Summa</p>
                        <p className="text-green-400 font-bold">{formatPrice(sale.totalAmount, sale.currency)}</p>
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-teal-400 transition-transform ml-4 flex-shrink-0 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="bg-white/5 border-t border-white/10 px-6 py-4 space-y-4">
                      {/* Mahsulotlar */}
                      <div>
                        <p className="text-sm font-semibold text-teal-300 mb-2">📦 Mahsulotlar:</p>
                        <div className="space-y-2">
                          {sale.items.map((item, idx) => (
                            <div key={`${sale.id}-item-${idx}`} className="space-y-1 bg-white/5 p-3 rounded">
                              <div className="flex justify-between text-sm text-gray-300">
                                <span className="font-semibold">{item.product?.name || 'Noma\'lum'}</span>
                                <span>x{item.quantity}</span>
                              </div>
                              {item.imei && (
                                <div className="text-xs text-gray-400 bg-blue-500/20 border border-blue-500/30 rounded p-2">
                                  <p className="text-gray-400">IMEKA:</p>
                                  <p className="text-blue-300 font-mono">{item.imei}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* To'lov Turlari */}
                      <div>
                        <p className="text-sm font-semibold text-teal-300 mb-2">💰 To'lov Turlari:</p>
                        <div className="space-y-2">
                          {sale.paymentMethods && sale.paymentMethods.length > 0 ? (
                            <>
                              {sale.paymentMethods.map((method, idx) => {
                                const typeText = 
                                  method.type === 'cash' ? '💵 Naqd' :
                                  method.type === 'debt' ? '📝 Qarz' :
                                  method.type === 'click' ? '📱 Click' :
                                  '🏧 Terminal'
                                return (
                                  <div key={`${sale.id}-payment-${idx}`} className="flex justify-between text-sm bg-white/5 p-3 rounded">
                                    <span className="text-gray-300">{typeText}</span>
                                    <span className="text-white font-semibold">{formatPrice(method.amount, sale.currency)}</span>
                                  </div>
                                )
                              })}
                              <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Jami Summa:</span>
                                  <span className="text-green-400 font-semibold">{formatPrice(sale.totalAmount, sale.currency)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">To'langan:</span>
                                  <span className="text-cyan-400 font-semibold">{formatPrice(sale.paidAmount || 0, sale.currency)}</span>
                                </div>
                                {sale.totalAmount > (sale.paidAmount || 0) && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Qarz:</span>
                                    <span className="text-red-400 font-semibold">{formatPrice(sale.totalAmount - (sale.paidAmount || 0), sale.currency)}</span>
                                  </div>
                                )}
                                {/* Summary Line */}
                                <div className="bg-teal-500/10 border border-teal-500/30 rounded p-3 mt-3">
                                  <p className="text-sm text-teal-300">
                                    <span className="font-semibold">{formatPrice(sale.totalAmount, sale.currency)}</span>
                                    <span className="text-gray-400"> dan </span>
                                    {sale.paymentMethods.map((method, idx) => {
                                      const typeText = 
                                        method.type === 'cash' ? 'naqd' :
                                        method.type === 'debt' ? 'qarz' :
                                        method.type === 'click' ? 'click' :
                                        'terminal'
                                      return (
                                        <span key={`${sale.id}-summary-${idx}`}>
                                          <span className="font-semibold">{formatPrice(method.amount, sale.currency)}</span>
                                          <span className="text-gray-400"> {typeText}</span>
                                          {idx < sale.paymentMethods!.length - 1 && <span className="text-gray-400"> va </span>}
                                        </span>
                                      )
                                    })}
                                    {sale.totalAmount > (sale.paidAmount || 0) && (
                                      <>
                                        <span className="text-gray-400"> va </span>
                                        <span className="font-semibold">{formatPrice(sale.totalAmount - (sale.paidAmount || 0), sale.currency)}</span>
                                        <span className="text-gray-400"> qarz</span>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <p className="text-gray-400 text-sm">To'lov ma'lumotlari yo'q</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-white/10">
                        <button
                          onClick={() => handleDeleteSale(saleId)}
                          disabled={isDeleting === saleId}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition disabled:opacity-50 font-semibold text-sm"
                        >
                          <Trash2 size={16} />
                          {isDeleting === saleId ? 'O\'chirilmoqda...' : 'O\'chirish'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
              })
            )}
          </div>
        </div>
      </div>
    </CashierLayout>
  )
}

