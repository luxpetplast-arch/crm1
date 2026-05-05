'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layouts/AdminLayout'
import { DollarSign, ChevronDown, Trash2, Plus, X } from 'lucide-react'

interface SaleItem {
  product?: { name: string; id: string }
  quantity: number
  originalPrice: number
  salePrice: number
  total: number
  imei?: string
  currency?: 'USD' | 'UZS'
}

interface PaymentMethod {
  type: 'cash' | 'debt' | 'click' | 'terminal'
  amount: number
}

interface Sale {
  id: string
  customer?: { name: string; phone?: string }
  branch?: { name: string; id: string; _id?: string }
  cashier?: { username: string }
  totalAmount: number
  paidAmount: number
  change: number
  items: SaleItem[]
  paymentMethods?: PaymentMethod[]
  createdAt: string
  status: string
  notes?: string
  currency?: 'USD' | 'UZS'
}

interface Branch {
  id: string
  _id?: string
  name: string
}

export default function CashierRegisterPage() {
  const router = useRouter()
  const [sales, setSales] = useState<Sale[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [incomes, setIncomes] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | null>(null)
  const [currencyType, setCurrencyType] = useState<'USD' | 'UZS' | 'BOTH' | null>(null)
  const [amountUSD, setAmountUSD] = useState('')
  const [amountUZS, setAmountUZS] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const formatPrice = (price?: number, currency?: 'USD' | 'UZS'): string => {
    if (!price || isNaN(price)) return '0'
    if (currency === 'USD') return `$${price.toFixed(2)}`
    return `${Math.floor(price).toLocaleString('uz-UZ')} so'm`
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/')
      } else {
        fetchData()
      }
    }
  }, [router])

  // Debug: Log when incomes/expenses change
  useEffect(() => {
    console.log('>>> Incomes state updated:', incomes.length, 'records')
  }, [incomes])

  useEffect(() => {
    console.log('>>> Expenses state updated:', expenses.length, 'records')
  }, [expenses])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const token = localStorage.getItem('adminToken')

      const [salesRes, branchesRes, incomeRes, expenseRes] = await Promise.all([
        fetch(
          `${apiUrl}/sales`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        ),
        fetch(`${apiUrl}/branches`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/income`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/expenses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const salesData = await salesRes.json()
      const branchesData = await branchesRes.json()
      const incomeData = await incomeRes.json()
      const expenseData = await expenseRes.json()

      console.log('=== FETCH DATA RESULTS ===')
      console.log('Sales response:', salesData)
      console.log('Branches response:', branchesData)
      console.log('Income response:', incomeData)
      console.log('Expense response:', expenseData)

      if (salesData.success && Array.isArray(salesData.data)) {
        // Transform _id to id for consistency
        const transformedSales = salesData.data.map((sale: any) => ({
          ...sale,
          id: sale._id || sale.id
        }))
        setSales(transformedSales)
      }
      if (branchesData.success && Array.isArray(branchesData.data)) {
        setBranches(branchesData.data)
      }
      
      // Store income and expense data in state for cash calculation
      if (incomeData.success && Array.isArray(incomeData.data)) {
        console.log('✓ Setting incomes:', incomeData.data.length, 'records')
        setIncomes(incomeData.data)
      } else {
        console.log('✗ Income data invalid:', incomeData)
      }
      
      if (expenseData.success && Array.isArray(expenseData.data)) {
        console.log('✓ Setting expenses:', expenseData.data.length, 'records')
        setExpenses(expenseData.data)
      } else {
        console.log('✗ Expense data invalid:', expenseData)
      }
    } catch (err) {
      setError('Ma\'lumotlarni yuklashda xato')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = sales.filter(sale => {
    const branchMatch = selectedBranch === 'all' || sale.branch?.id === selectedBranch
    return branchMatch
  })

  // Calculate totals by payment method and currency using useMemo
  // Kassa faqat income/expense yozuvlaridan hisoblanadi - savdo tarixidan emas
  const paymentTotals = useMemo(() => {
    const totals = {
      cashUSD: 0,
      cashUZS: 0,
      click: 0,
      terminal: 0,
      debt: 0
    }
    
    // Click va Terminal - savdolardan hisoblanadi (ular income/expense ga kirmaydi)
    filteredSales.forEach(sale => {
      sale.paymentMethods?.forEach(method => {
        if (method.type === 'click') totals.click += method.amount
        else if (method.type === 'terminal') totals.terminal += method.amount
        else if (method.type === 'debt') totals.debt += method.amount
      })
    })
    
    // Naqd pul (cash) - faqat income/expense yozuvlaridan hisoblanadi
    // Bu savdo o'chirilganda kassaga ta'sir qilmaydi
    incomes.forEach((income: any) => {
      if (income.amountUSD) totals.cashUSD += income.amountUSD
      if (income.amountUZS) totals.cashUZS += income.amountUZS
    })
    
    expenses.forEach((expense: any) => {
      if (expense.amountUSD) totals.cashUSD -= expense.amountUSD
      if (expense.amountUZS) totals.cashUZS -= expense.amountUZS
    })
    
    return totals
  }, [filteredSales, incomes, expenses])

  const handleDeleteSale = async (saleId: string) => {
    if (!confirm('Ushbu savdoni o\'chirishni xohlaysizmi?')) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const token = localStorage.getItem('adminToken')

      const response = await fetch(`${apiUrl}/sales/${saleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setSales(sales.filter(s => s.id !== saleId))
      } else {
        alert('Savdoni o\'chirishda xato')
      }
    } catch (err) {
      console.error(err)
      alert('Xato yuz berdi')
    }
  }

  const handleAddTransaction = async () => {
    const usdAmount = parseFloat(amountUSD) || 0
    const uzsAmount = parseFloat(amountUZS) || 0
    
    if (!transactionType || !currencyType) {
      alert('Iltimos, tur va valyutani tanlang')
      return
    }
    
    if ((currencyType === 'USD' && usdAmount === 0) || 
        (currencyType === 'UZS' && uzsAmount === 0) ||
        (currencyType === 'BOTH' && usdAmount === 0 && uzsAmount === 0)) {
      alert('Iltimos, summani kiriting')
      return
    }

    try {
      setSubmitting(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const token = localStorage.getItem('adminToken')

      const endpoint = transactionType === 'income' ? '/income' : '/expenses'
      
      // Send both USD and UZS amounts
      const payload = transactionType === 'income'
        ? {
            source: description || 'Bu odamdan olindi',
            amountUSD: currencyType === 'USD' || currencyType === 'BOTH' ? usdAmount : 0,
            amountUZS: currencyType === 'UZS' || currencyType === 'BOTH' ? uzsAmount : 0,
            description: description || 'Bu odamdan olindi',
            category: 'other'
          }
        : {
            category: 'other',
            amountUSD: currencyType === 'USD' || currencyType === 'BOTH' ? usdAmount : 0,
            amountUZS: currencyType === 'UZS' || currencyType === 'BOTH' ? uzsAmount : 0,
            description: description || 'Chiqim',
            vendor: description || 'Chiqim'
          }

      console.log('Sending payload:', payload)
      console.log('To endpoint:', `${apiUrl}${endpoint}`)

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      console.log('Transaction response:', result)

      if (response.ok) {
        alert(`${transactionType === 'income' ? 'Kirim' : 'Chiqim'} muvaffaqiyatli qo'shildi`)
        setShowAddModal(false)
        setTransactionType(null)
        setCurrencyType(null)
        setAmountUSD('')
        setAmountUZS('')
        setDescription('')
        await fetchData() // Refresh data
      } else {
        alert('Xato yuz berdi')
      }
    } catch (err) {
      console.error(err)
      alert('Xato yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Kassa ma\'lumotlari yuklanimoqda...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Kassa Registri</h1>
            <p className="text-gray-400 mt-1">Barcha savdo tranzaksiyalari</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} />
            Qo'shish
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Naqd Pul ($)</p>
                <p className="text-3xl font-bold text-green-400 mt-2">${(paymentTotals.cashUSD).toFixed(2)}</p>
              </div>
              <DollarSign size={32} className="text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Naqd Pul (so'm)</p>
                <p className="text-3xl font-bold text-emerald-400 mt-2">{formatPrice(paymentTotals.cashUZS)}</p>
              </div>
              <DollarSign size={32} className="text-emerald-500 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Click</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{formatPrice(paymentTotals.click)}</p>
              </div>
              <DollarSign size={32} className="text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Terminal</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">{formatPrice(paymentTotals.terminal)}</p>
              </div>
              <DollarSign size={32} className="text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 border border-white/10 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-300 text-sm font-medium mb-2">Filial</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              >
                <option value="all">Barcha Filiallar</option>
                {branches.map(b => (
                  <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sales List */}
        <div className="bg-slate-800/50 border border-white/10 rounded-lg overflow-hidden">
          {filteredSales.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Savdolar topilmadi
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredSales.map(sale => (
                <div key={sale.id} className="p-4 hover:bg-white/5 transition">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-white font-semibold">{sale.cashier?.username || 'Noma\'lum'}</p>
                        <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded">
                          {sale.notes === 'Ko\'chaga sotuv' ? 'Ko\'chaga sotuv' : (sale.customer?.name || 'Noma\'lum')}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {new Date(sale.createdAt).toLocaleDateString('uz-UZ')} {new Date(sale.createdAt).toLocaleTimeString('uz-UZ')}
                      </p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-green-400 font-bold">{formatPrice(sale.paidAmount, sale.currency)}</p>
                      <p className="text-gray-400 text-sm">{sale.items?.length || 0} mahsulot</p>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition-transform ${expandedSaleId === sale.id ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {expandedSaleId === sale.id && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Kassir</p>
                          <p className="text-white font-semibold">{sale.cashier?.username || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Filial</p>
                          <p className="text-white font-semibold">{sale.branch?.name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Mijoz</p>
                          <p className="text-white font-semibold">
                            {sale.notes === 'Ko\'chaga sotuv' ? 'Ko\'chaga sotuv' : (sale.customer?.name || 'Noma\'lum')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Sana va Vaqt</p>
                          <p className="text-white font-semibold">
                            {new Date(sale.createdAt).toLocaleDateString('uz-UZ')} {new Date(sale.createdAt).toLocaleTimeString('uz-UZ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm transition"
                        >
                          <Trash2 size={16} />
                          O'chirish
                        </button>
                      </div>

                      {sale.items && sale.items.length > 0 && (
                        <div className="pt-3 border-t border-white/10">
                          <p className="text-gray-300 font-semibold text-sm mb-2">Mahsulotlar</p>
                          <div className="space-y-2">
                            {sale.items.map((item, idx) => (
                              <div key={`${sale.id}-item-${idx}`} className="bg-white/5 p-2 rounded text-sm">
                                <div className="flex justify-between mb-1">
                                  <span className="text-gray-300">{item.product?.name || 'Unknown'} x{item.quantity}</span>
                                  <span className="text-green-400 font-semibold">{formatPrice(item.total, item.currency || sale.currency)}</span>
                                </div>
                                {item.imei && (
                                  <div className="text-xs text-blue-300 bg-blue-500/20 border border-blue-500/30 rounded p-1 mb-1">
                                    IMEKA: {item.imei}
                                  </div>
                                )}
                                <div className="flex justify-between text-xs text-gray-400">
                                  <span>Katalog: {formatPrice(item.originalPrice, item.currency || sale.currency)}</span>
                                  <span>Sotilgan: {formatPrice(item.salePrice, item.currency || sale.currency)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {sale.paymentMethods && sale.paymentMethods.length > 0 && (
                        <div className="pt-3 border-t border-white/10">
                          <p className="text-gray-300 font-semibold text-sm mb-2">Tolov Turlari</p>
                          <div className="space-y-1">
                            {sale.paymentMethods.map((method, idx) => {
                              const typeText = method.type === 'cash' ? 'Naqd' : method.type === 'debt' ? 'Qarz' : method.type === 'click' ? 'Click' : 'Terminal'
                              return (
                                <div key={`${sale.id}-payment-${idx}`} className="flex justify-between text-sm text-gray-300 bg-white/5 p-2 rounded">
                                  <span>{typeText}</span>
                                  <span className="text-cyan-400">{formatPrice(method.amount, sale.currency)}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-white/10 bg-white/5 p-3 rounded">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Jami Summa</span>
                          <span className="text-white font-bold">{formatPrice(sale.totalAmount, sale.currency)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">To'langan</span>
                          <span className="text-green-400 font-bold">{formatPrice(sale.paidAmount, sale.currency)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Kirim yoki Chiqim</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setTransactionType(null)
                  setAmountUSD('')
                  setAmountUZS('')
                  setDescription('')
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {!transactionType ? (
              <div className="space-y-3">
                <button
                  onClick={() => setTransactionType('income')}
                  className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 py-3 rounded-lg font-semibold transition"
                >
                  ✓ Kirim (Bu odamdan olindi)
                </button>
                <button
                  onClick={() => setTransactionType('expense')}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 py-3 rounded-lg font-semibold transition"
                >
                  ✗ Chiqim
                </button>
              </div>
            ) : !currencyType ? (
              <div className="space-y-4">
                <p className="text-gray-300 text-sm">Valyuta turini tanlang:</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setCurrencyType('USD')}
                    className="py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 rounded-lg font-semibold transition"
                  >
                    $ Dollar
                  </button>
                  <button
                    onClick={() => setCurrencyType('UZS')}
                    className="py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 rounded-lg font-semibold transition"
                  >
                    so'm So'm
                  </button>
                  <button
                    onClick={() => setCurrencyType('BOTH')}
                    className="py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 rounded-lg font-semibold transition"
                  >
                    $ + so'm
                  </button>
                </div>
                <button
                  onClick={() => setTransactionType(null)}
                  className="w-full bg-slate-700/50 hover:bg-slate-700 border border-white/10 text-gray-300 py-2 rounded-lg transition"
                >
                  Orqaga
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {(currencyType === 'USD' || currencyType === 'BOTH') && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Dollar Summasi ($)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={amountUSD}
                      onChange={(e) => {
                        const value = e.target.value
                        // Only allow numbers and decimal point
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          setAmountUSD(value)
                        }
                      }}
                      placeholder="0.00"
                      className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                )}

                {(currencyType === 'UZS' || currencyType === 'BOTH') && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      So'm Summasi
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={amountUZS}
                      onChange={(e) => {
                        const value = e.target.value
                        // Only allow numbers
                        if (value === '' || /^\d*$/.test(value)) {
                          setAmountUZS(value)
                        }
                      }}
                      placeholder="0"
                      className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Izoh (ixtiyoriy)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={transactionType === 'income' ? 'Bu odamdan olindi' : 'Chiqim'}
                    className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      setCurrencyType(null)
                      setAmountUSD('')
                      setAmountUZS('')
                      setDescription('')
                    }}
                    className="flex-1 bg-slate-700/50 hover:bg-slate-700 border border-white/10 text-gray-300 py-2 rounded-lg transition"
                  >
                    Orqaga
                  </button>
                  <button
                    onClick={handleAddTransaction}
                    disabled={submitting}
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

