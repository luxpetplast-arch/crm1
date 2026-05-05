'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import CashierLayout from '@/components/layouts/CashierLayout'
import { ArrowLeft, Plus, Trash2, Calendar, Package, ShoppingCart, X } from 'lucide-react'
import { getCustomer, getSales, createSale, getProducts } from '@/lib/api'

interface Sale {
  id: string
  totalAmount: number
  cashier?: { name: string; username: string }
  items: Array<{ product?: { name: string }; quantity: number }>
  createdAt: string
}

interface SaleItem {
  id: string
  productId: string
  productName: string
  quantity: number
  costPrice: number
  originalPrice: number
  salePrice: number
  total: number
  imei?: string
  imeiCount?: number
  currency: 'USD' | 'UZS'
  originalCurrency: 'USD' | 'UZS'
}

interface PaymentMethod {
  type: 'cash' | 'click' | 'terminal'
  amount: number
}

interface Product {
  id: string
  name: string
  sellPrice: number
  stock: number
  costPrice?: number
  imeiList?: Array<{ imei: string; used: boolean }>
  currency?: 'USD' | 'UZS'
  sellCurrency?: 'USD' | 'UZS'
}

interface CustomerDetail {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  totalPurchase?: number
  debt?: number // Deprecated
  debtUSD?: number // Debt in USD
  debtUZS?: number // Debt in UZS (so'm)
}

interface PaymentState {
  [key: string]: number
}

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [showPayDebtModal, setShowPayDebtModal] = useState(false)
  const [payDebtAmount, setPayDebtAmount] = useState('')
  const [payDebtCurrency, setPayDebtCurrency] = useState<'USD' | 'UZS'>('USD')
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currency, setCurrency] = useState<'USD' | 'UZS'>('USD')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingPrice, setEditingPrice] = useState(0)
  const [exchangeRate, setExchangeRate] = useState(12500)
  const [paymentState, setPaymentState] = useState<PaymentState>({})
  const [productCurrencies, setProductCurrencies] = useState<{ [key: string]: 'USD' | 'UZS' }>({})

  const convertPrice = (price: number, fromCurrency: 'USD' | 'UZS', toCurrency: 'USD' | 'UZS'): number => {
    if (fromCurrency === toCurrency) return price
    if (fromCurrency === 'USD' && toCurrency === 'UZS') {
      return price * exchangeRate
    }
    if (fromCurrency === 'UZS' && toCurrency === 'USD') {
      return price / exchangeRate
    }
    return price
  }

  const formatPrice = (price?: number, currency?: 'USD' | 'UZS'): string => {
    if (!price || isNaN(price)) return '0'
    if (currency === 'USD') {
      return `$${price.toFixed(2)}`
    }
    return `${Math.floor(price).toLocaleString('uz-UZ')} so'm`
  }
  
  const getProductDisplayCurrency = (productId: string, originalCurrency: 'USD' | 'UZS'): 'USD' | 'UZS' => {
    return productCurrencies[productId] || originalCurrency
  }

  const fetchData = async () => {
    if (!customerId) return
    setError(null)
    
    try {
      // Fetch current user to get their branch
      const token = localStorage.getItem('cashierToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      
      let userBranchId = null
      try {
        console.log('[CUSTOMER DETAIL] Fetching user data from /auth/me...')
        const userResponse = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        const userData = await userResponse.json()
        console.log('[CUSTOMER DETAIL] User data response:', userData)
        
        if (userData.success && userData.data?.branch) {
          userBranchId = typeof userData.data.branch === 'string' 
            ? userData.data.branch 
            : userData.data.branch._id || userData.data.branch.id
          console.log('[CUSTOMER DETAIL] ✅ User branch from API:', userBranchId)
        } else {
          console.log('[CUSTOMER DETAIL] ⚠️ No branch in user data')
        }
      } catch (err) {
        console.error('[CUSTOMER DETAIL] Error fetching user:', err)
      }
      
      // Fallback to localStorage if API fails
      if (!userBranchId) {
        userBranchId = localStorage.getItem('branchId')
        console.log('[CUSTOMER DETAIL] Using branchId from localStorage:', userBranchId)
      }
      
      console.log('[CUSTOMER DETAIL] Final userBranchId:', userBranchId)
      
      const [customerRes, salesRes, productsRes] = await Promise.all([
        getCustomer(customerId),
        getSales(),
        getProducts()
      ])

      if (customerRes.success && customerRes.data) {
        setCustomer(customerRes.data as CustomerDetail)
      } else {
        setError(customerRes.error || 'Mijozni yuklashda xato')
      }

      if (salesRes.success && salesRes.data) {
        const customerSales = (salesRes.data as Sale[]).filter(
          sale => sale.id === customerId || (sale as any).customer?.id === customerId
        )
        setSales(customerSales)
      }

      if (productsRes.success && productsRes.data) {
        console.log('[CUSTOMER DETAIL] All products count:', Array.isArray(productsRes.data) ? productsRes.data.length : 0)
        
        const filteredByBranch = userBranchId 
          ? (productsRes.data as Product[]).filter(p => {
              const productBranch = (p as any).branch
              const productBranchId = typeof productBranch === 'string' 
                ? productBranch 
                : (productBranch?._id || productBranch?.id || productBranch?.toString())
              
              const branchMatch = productBranchId === userBranchId
              console.log('[CUSTOMER DETAIL] Checking product:', { 
                name: p.name, 
                productBranchId, 
                userBranchId,
                matches: branchMatch
              })
              return branchMatch
            })
          : productsRes.data as Product[]
        
        console.log('[CUSTOMER DETAIL] ✅ Filtered products for branch:', filteredByBranch.length)
        setProducts(filteredByBranch)
      }
    } catch (err) {
      console.error('[CUSTOMER DETAIL] ❌ Error fetching data:', err)
      setError('Ma\'lumotlarni yuklashda xato')
    }
  }

  const fetchExchangeRate = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      const response = await fetch(`${apiUrl}/exchange-rate/current`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setExchangeRate(data.data.rate)
        console.log('✅ Exchange rate updated:', data.data.rate)
      }
    } catch (err) {
      console.error('Exchange rate fetch error:', err)
    }
  }

  const handleCompleteSale = async () => {
    if (!customer || saleItems.length === 0) {
      setError('Barcha maydonlarni to\'ldiring')
      return
    }

    if (paymentMethods.length === 0) {
      setError('Tolov turini tanlang')
      return
    }

    const totalAmount = saleItems.reduce((sum, item) => sum + item.total, 0)
    const totalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0)

    // Qarz bo'lsa, savdo yakunlanishi kerak (totalPaid < totalAmount bo'lsa ham)
    // Lekin agar qarz bo'lmasa, to'lov yetarli bo'lishi kerak
    const hasDebt = totalPaid < totalAmount
    if (hasDebt && totalPaid === 0) {
      setError('Kamida bir xil tolov turi tanlang')
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    const saleData = {
      branch: localStorage.getItem('branchId') || '507f1f77bcf86cd799439011',
      customer: customer.id,
      items: saleItems.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        originalPrice: item.originalPrice,
        salePrice: item.salePrice,
        imei: item.imei,
        total: item.total
      })),
      totalAmount: totalAmount,
      paidAmount: totalPaid,
      change: Math.max(0, totalPaid - totalAmount),
      currency: currency,
      paymentMethods: paymentMethods,
      notes: ''
    }
    
    const response = await createSale(saleData)
    
    if (response.success) {
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setSaleItems([])
        setPaymentMethods([])
        setCurrency('USD')
        setShowSaleModal(false)
        fetchData()
      }, 2000)
    } else {
      setError(response.error || 'Savdo qo\'shishda xato')
    }
    setIsSubmitting(false)
  }

  const handlePayDebt = async () => {
    if (!customer || !payDebtAmount) {
      setError('Summani kiriting')
      return
    }

    const amount = parseFloat(payDebtAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('To\'g\'ri summa kiriting')
      return
    }

    // Check if payment amount exceeds debt
    const currentDebt = payDebtCurrency === 'USD' ? (customer.debtUSD || 0) : (customer.debtUZS || 0)
    if (amount > currentDebt) {
      setError(`Qarz ${payDebtCurrency === 'USD' ? '$' + currentDebt.toFixed(2) : Math.floor(currentDebt).toLocaleString('uz-UZ') + ' so\'m'}. Ortiq to\'lash mumkin emas.`)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const token = localStorage.getItem('cashierToken')

      // Update customer debt
      const newDebtUSD = payDebtCurrency === 'USD' ? (customer.debtUSD || 0) - amount : (customer.debtUSD || 0)
      const newDebtUZS = payDebtCurrency === 'UZS' ? (customer.debtUZS || 0) - amount : (customer.debtUZS || 0)

      const response = await fetch(`${apiUrl}/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          debtUSD: newDebtUSD,
          debtUZS: newDebtUZS
        })
      })

      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          setShowPayDebtModal(false)
          setPayDebtAmount('')
          setPayDebtCurrency('USD')
          fetchData()
        }, 2000)
      } else {
        setError('Qarzni to\'lashda xato')
      }
    } catch (err) {
      console.error(err)
      setError('Xato yuz berdi')
    }

    setIsSubmitting(false)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cashierToken')
      if (!token) {
        router.push('/')
        return
      }
    }
    
    // Extract ID from params
    const extractId = async () => {
      if (params?.id) {
        const id = typeof params.id === 'string' ? params.id : params.id[0]
        console.log('[CUSTOMER DETAIL] Extracted ID:', id)
        setCustomerId(id)
      } else {
        console.error('[CUSTOMER DETAIL] No ID in params:', params)
      }
    }
    
    extractId()
  }, [router, params])

  useEffect(() => {
    if (customerId) {
      fetchData()
      fetchExchangeRate()
    }
  }, [customerId])

  const filteredProducts = products.filter((p) => {
    const searchLower = productSearch.toLowerCase().trim()
    
    // Agar qidirilmagan bo'lsa, barcha mavjud mahsulotlarni ko'rsatish
    if (!searchLower) {
      const hasAvailableImei = (p.imeiList && p.imeiList.some(item => !item.used)) || ((p as any).imei && (p as any).imei.trim() !== '')
      return hasAvailableImei
    }
    
    // Search by name
    const nameMatch = p.name.toLowerCase().includes(searchLower)
    
    // Search by IMEI in imeiList (only available ones)
    const imeiListMatch = p.imeiList && p.imeiList.some(item => item.imei.toLowerCase().includes(searchLower) && !item.used)
    
    // Search by IMEI string field (comma-separated)
    const imeiStringMatch = (p as any).imei && (p as any).imei.toLowerCase().includes(searchLower)
    
    // Check if product has any IMEI available
    const hasAvailableImei = (p.imeiList && p.imeiList.some(item => !item.used)) || ((p as any).imei && (p as any).imei.trim() !== '')
    
    return hasAvailableImei && (nameMatch || imeiListMatch || imeiStringMatch)
  })

  const handleAddItem = (product: Product, imei?: string, quantity: number = 1) => {
    // Agar stock yetarli bo'lmasa
    if (!imei && product.stock < quantity) {
      setError(`Maksimum ${product.stock} ta mavjud`)
      return
    }

    const originalCurrency = product.sellCurrency || product.currency || 'USD'
    const selectedCurrency = getProductDisplayCurrency(product.id, originalCurrency)
    const convertedPrice = convertPrice(product.sellPrice, originalCurrency, selectedCurrency)

    const existingItem = saleItems.find((i) => i.productId === product.id && i.imei === imei && i.currency === selectedCurrency)
    
    if (existingItem) {
      setSaleItems(
        saleItems.map((i) =>
          i.id === existingItem.id
            ? { 
                ...i, 
                quantity: i.quantity + quantity, 
                total: (i.quantity + quantity) * i.salePrice 
              }
            : i
        )
      )
    } else {
      setSaleItems([
        ...saleItems,
        {
          id: Math.random().toString(),
          productId: product.id,
          productName: product.name,
          quantity: quantity,
          costPrice: product.costPrice || 0,
          originalPrice: convertedPrice,
          salePrice: convertedPrice,
          total: convertedPrice * quantity,
          imei: imei,
          imeiCount: imei ? quantity : product.stock,
          currency: selectedCurrency,
          originalCurrency: originalCurrency
        },
      ])
    }
    setProductSearch('')
  }

  const handleRemoveItem = (id: string) => {
    setSaleItems(saleItems.filter((i) => i.id !== id))
  }

  const totalAmount = saleItems.reduce((sum, item) => {
    // Keep in original currency (USD)
    const amountInUSD = item.currency === 'USD' ? item.total : item.total / exchangeRate
    return sum + amountInUSD
  }, 0)
  const totalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0)
  const finalDebt = Math.max(0, totalAmount - totalPaid)

  const handleAddPaymentMethod = (type: 'cash' | 'click' | 'terminal') => {
    if (paymentMethods.length >= 2) {
      setError('Maksimum 2 ta tolov turi tanlash mumkin')
      return
    }

    if (paymentMethods.some(m => m.type === type)) {
      setError('Bu tolov turi allaqachon tanlangan')
      return
    }

    setPaymentMethods([...paymentMethods, { type, amount: 0 }])
  }

  const handleRemovePaymentMethod = (index: number) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index))
  }

  const handleUpdatePaymentAmount = (index: number, amount: number) => {
    const updated = [...paymentMethods]
    updated[index].amount = amount
    setPaymentMethods(updated)
  }

  const handleUpdatePrice = (itemId: string, newPrice: number) => {
    const item = saleItems.find(i => i.id === itemId)
    if (!item) return

    setSaleItems(saleItems.map(i =>
      i.id === itemId
        ? { ...i, salePrice: newPrice, total: newPrice * i.quantity }
        : i
    ))
    setEditingItemId(null)
    setError(null)
  }

  if (!customer) {
    return (
      <CashierLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Mijoz topilmadi</p>
          <Link href="/cashier/customers" className="text-teal-600 hover:underline mt-4 inline-block">
            Orqaga qaytish
          </Link>
        </div>
      </CashierLayout>
    )
  }

  return (
    <CashierLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/cashier/customers" className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft size={24} className="text-teal-400" />
          </Link>
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">{customer.name}</h1>
            <p className="text-gray-400 mt-1">{customer.phone}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 backdrop-blur-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/30 backdrop-blur-sm">
            <p className="text-sm text-blue-300 font-medium">Jami Savdolar</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">{sales.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-500/30 backdrop-blur-sm">
            <p className="text-sm text-green-300 font-medium">Jami Summa</p>
            <p className="text-3xl font-bold text-green-400 mt-2">${(customer.totalPurchase || 0).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl p-4 border border-red-500/30 backdrop-blur-sm">
            <p className="text-sm text-red-300 font-medium">Qarz ($)</p>
            <p className="text-3xl font-bold text-red-400 mt-2">${(customer.debtUSD || 0).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl p-4 border border-orange-500/30 backdrop-blur-sm">
            <p className="text-sm text-orange-300 font-medium">Qarz (so'm)</p>
            <p className="text-2xl font-bold text-orange-400 mt-2">{Math.floor(customer.debtUZS || 0).toLocaleString('uz-UZ')}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-4 border border-purple-500/30 backdrop-blur-sm">
            <p className="text-sm text-purple-300 font-medium">Manzil</p>
            <p className="text-sm font-semibold text-purple-300 mt-2">{customer.address || '-'}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">Savdo Tarixi</h2>
            <div className="flex gap-2">
              <button onClick={() => setShowSaleModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-teal-500/50 transition font-semibold">
                <ShoppingCart size={20} />
                Savdo Qilish
              </button>
              {((customer.debtUSD && customer.debtUSD > 0) || (customer.debtUZS && customer.debtUZS > 0)) && (
                <button onClick={() => setShowPayDebtModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition font-semibold">
                  💰 Qarzni To'lash
                </button>
              )}
            </div>
          </div>

          {sales.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Savdolar topilmadi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-teal-500/50 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} className="text-gray-400" />
                      <p className="text-sm text-gray-400">{new Date(sale.createdAt).toLocaleDateString('uz-UZ')}</p>
                    </div>
                    <p className="font-semibold text-white">
                      {sale.items.map(item => item.product?.name || 'Noma\'lum').join(', ')}
                    </p>
                    <p className="text-sm text-gray-400">Miqdor: {sale.items.reduce((sum, item) => sum + item.quantity, 0)} | Kassir: {sale.cashier?.name || sale.cashier?.username || '-'}</p>
                  </div>
                  <p className="text-lg font-bold text-green-400">${sale.totalAmount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {showSaleModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">Savdo Qilish</h2>
                <button onClick={() => setShowSaleModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">IMEI Orqali Qidirish</label>
                    <input type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="IMEI yoki mahsulot nomini kiriting" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-gray-400 transition-all backdrop-blur-sm" />
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        {productSearch ? 'Mahsulot topilmadi' : 'Qidirish uchun IMEKA yoki nomi kiriting'}
                      </div>
                    ) : (
                      filteredProducts.flatMap((product) => {
                        const searchLower = productSearch.toLowerCase()
                        
                        // Helper: render a single IMEI card
                        const renderCard = (imei: string | undefined, count: number, keyPrefix: string) => (
                          <button key={keyPrefix} onClick={() => handleAddItem(product, imei, 1)}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-teal-500/50 transition text-left">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-white">{product.name}</p>
                                {imei && <p className="text-xs text-gray-400">IMEKA: {imei}{count > 1 ? ` (${count} ta)` : ''}</p>}
                              </div>
                              <Plus size={20} className="text-teal-400 flex-shrink-0 ml-2" />
                            </div>
                            <div className="flex gap-2 mb-2">
                              <div onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setProductCurrencies({ ...productCurrencies, [product.id]: 'USD' }) }}
                                className={`flex-1 py-1 px-2 rounded text-xs font-semibold transition cursor-pointer ${getProductDisplayCurrency(product.id, product.sellCurrency || product.currency || 'USD') === 'USD' ? 'bg-green-500/30 text-green-300 border border-green-500/50' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                                $ Dollar
                              </div>
                              <div onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setProductCurrencies({ ...productCurrencies, [product.id]: 'UZS' }) }}
                                className={`flex-1 py-1 px-2 rounded text-xs font-semibold transition cursor-pointer ${getProductDisplayCurrency(product.id, product.sellCurrency || product.currency || 'USD') === 'UZS' ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                                so'm So'm
                              </div>
                            </div>
                            <div className="flex gap-3 text-xs">
                              <span className="text-yellow-400">Olish: {formatPrice(convertPrice(product.costPrice || 0, product.currency || 'USD', getProductDisplayCurrency(product.id, product.sellCurrency || product.currency || 'USD')), getProductDisplayCurrency(product.id, product.sellCurrency || product.currency || 'USD'))}</span>
                              <span className="text-green-400">Sotish: {formatPrice(convertPrice(product.sellPrice, product.sellCurrency || product.currency || 'USD', getProductDisplayCurrency(product.id, product.sellCurrency || product.currency || 'USD')), getProductDisplayCurrency(product.id, product.sellCurrency || product.currency || 'USD'))}</span>
                            </div>
                          </button>
                        )

                        // imeiList dan unique IMEIlar
                        if (product.imeiList && product.imeiList.length > 0) {
                          const available = product.imeiList.filter(item => {
                            if (item.used) return false
                            if (!searchLower) return true
                            return item.imei.toLowerCase().includes(searchLower) || product.name.toLowerCase().includes(searchLower)
                          })
                          const countMap: { [k: string]: number } = {}
                          available.forEach(item => { countMap[item.imei] = (countMap[item.imei] || 0) + 1 })
                          return Object.keys(countMap).map((imei, i) => renderCard(imei, countMap[imei], `${product.id}-list-${imei}-${i}`))
                        }

                        // imei string dan unique IMEIlar
                        if ((product as any).imei && (product as any).imei.trim() !== '') {
                          const arr = (product as any).imei.split(',').map((i: string) => i.trim()).filter((i: string) => i !== '')
                          const countMap: { [k: string]: number } = {}
                          arr.forEach((imei: string) => { countMap[imei] = (countMap[imei] || 0) + 1 })
                          const filtered = Object.keys(countMap).filter(imei => {
                            if (!searchLower) return true
                            return imei.toLowerCase().includes(searchLower) || product.name.toLowerCase().includes(searchLower)
                          })
                          return filtered.map((imei, i) => renderCard(imei, countMap[imei], `${product.id}-str-${imei}-${i}`))
                        }

                        // IMEI yo'q - oddiy mahsulot
                        return [renderCard(undefined, product.stock, `${product.id}-plain`)]
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                      <ShoppingCart size={20} className="text-teal-400" />
                      Savdo ({saleItems.length})
                    </h3>
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                      {saleItems.map((item) => (
                        <div key={item.id} className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-white text-sm">{item.productName}</p>
                              <div className="flex gap-3 mt-1 text-xs">
                                <span className="text-yellow-400">Olish: {formatPrice(item.costPrice, item.currency)}</span>
                                <span className="text-green-400">Sotish: {formatPrice(item.originalPrice, item.currency)}</span>
                              </div>
                            </div>
                            <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-300 transition">
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 bg-white/5 rounded p-2">
                            <span className="text-xs text-gray-400">Miqdor:</span>
                            <input type="number" min="1" max={item.imeiCount || 1} defaultValue={item.quantity} id={`qty-cart-${item.id}`} onChange={(e) => { let value = parseInt(e.target.value); if (isNaN(value) || value < 1) { value = 1; e.target.value = '1' } else if (value > (item.imeiCount || 1)) { value = item.imeiCount || 1; e.target.value = (item.imeiCount || 1).toString() } setSaleItems(saleItems.map(i => i.id === item.id ? { ...i, quantity: value, total: value * i.salePrice } : i)) }} className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Miqdor" />
                            <span className="text-xs text-gray-400">/ {item.imeiCount || 1}</span>
                          </div>

                          {editingItemId === item.id ? (
                            <div className="flex gap-2">
                              <input type="text" inputMode="decimal" value={editingPrice} onChange={(e) => { const value = e.target.value; if (value === '' || /^\d*\.?\d*$/.test(value)) { setEditingPrice(value === '' ? 0 : parseFloat(value)) } }} className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="0.00" />
                              <button onClick={() => handleUpdatePrice(item.id, editingPrice)} className="px-2 py-1 bg-green-500/20 hover:bg-green-500/40 rounded text-green-400 text-sm transition">OK</button>
                            </div>
                          ) : (
                            <button onClick={() => { setEditingItemId(item.id); setEditingPrice(item.salePrice) }} className="w-full text-left px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-teal-300 text-sm transition">
                              Tushib berish: {formatPrice(item.salePrice, item.currency)}
                            </button>
                          )}

                          <div className="text-right">
                            <p className="text-sm text-gray-400">Jami:</p>
                            <p className="font-bold text-teal-300">{formatPrice(item.total, item.currency)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {saleItems.length > 0 && (
                      <div className="border-t border-white/10 pt-3">
                        <div className="flex justify-between font-bold text-white">
                          <span>Jami:</span>
                          <span className="text-teal-300">
                            {currency === 'UZS' 
                              ? `${Math.floor(totalAmount * exchangeRate).toLocaleString('uz-UZ')} so'm` 
                              : `$${totalAmount.toFixed(2)}`
                            }
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {saleItems.length > 0 && (
                    <div className="space-y-4 border-t border-white/10 pt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tolov Turlari (maksimum 2 ta)</label>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {['cash', 'click', 'terminal', 'debt'].map(type => {
                            const isSelected = paymentMethods.some(m => m.type === type as any)
                            const typeText = type === 'cash' ? 'Naqd' : type === 'click' ? 'Click' : type === 'terminal' ? 'Terminal' : 'Qarz'
                            return (
                              <button key={type} onClick={() => { if (isSelected) { handleRemovePaymentMethod(paymentMethods.findIndex(m => m.type === type as any)) } else { handleAddPaymentMethod(type as any) } }} className={`py-2 px-3 rounded-lg font-semibold transition-all ${isSelected ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/50 border border-teal-400' : 'bg-white/10 text-gray-300 border border-white/10 hover:bg-white/20'}`}>
                                {typeText}
                              </button>
                            )
                          })}
                        </div>

                        <div className="space-y-2">
                          {paymentMethods.map((method, index) => {
                            const typeText = method.type === 'cash' ? 'Naqd' : method.type === 'click' ? 'Click' : method.type === 'terminal' ? 'Terminal' : 'Qarz'
                            const displayAmount = currency === 'UZS' ? (paymentState[`${method.type}_${index}`] || 0) : method.amount
                            return (
                              <div key={index} className="flex gap-2">
                                <label className="flex-1 text-sm text-gray-400 flex items-center">{typeText}:</label>
                                <input type="text" inputMode="decimal" value={displayAmount} onChange={(e) => { const value = e.target.value; if (value === '' || /^\d*\.?\d*$/.test(value)) { const numValue = value === '' ? 0 : parseFloat(value); setPaymentState({ ...paymentState, [`${method.type}_${index}`]: numValue }); const amountInUsd = currency === 'UZS' ? numValue / exchangeRate : numValue; handleUpdatePaymentAmount(index, amountInUsd) } }} className="w-32 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder={currency === 'UZS' ? '0' : '0.00'} />
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                        <p className="text-gray-400 text-xs mb-1">❌ Qarz</p>
                        <p className="font-bold text-red-400 text-lg">
                          {currency === 'UZS' 
                            ? `${Math.floor(Math.max(0, finalDebt) * exchangeRate).toLocaleString('uz-UZ')} so'm` 
                            : `$${Math.max(0, finalDebt).toFixed(2)}`
                          }
                        </p>
                      </div>

                      <button onClick={handleCompleteSale} disabled={saleItems.length === 0 || paymentMethods.length === 0 || isSubmitting} className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-lg hover:shadow-lg hover:shadow-teal-500/50 transition disabled:opacity-50 font-semibold">
                        {isSubmitting ? 'Jarayonda...' : 'Savdo Yakunlash'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pay Debt Modal */}
        {showPayDebtModal && customer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-8 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">Qarzni To'lash</h2>
                <button
                  onClick={() => {
                    setShowPayDebtModal(false)
                    setPayDebtAmount('')
                    setPayDebtCurrency('USD')
                    setError(null)
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4 backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Current Debt Display */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Joriy Qarz:</p>
                  <div className="flex justify-between items-center">
                    <span className="text-red-400 font-bold">${(customer.debtUSD || 0).toFixed(2)}</span>
                    <span className="text-orange-400 font-bold">{Math.floor(customer.debtUZS || 0).toLocaleString('uz-UZ')} so'm</span>
                  </div>
                </div>

                {/* Currency Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Valyuta</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPayDebtCurrency('USD')}
                      className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                        payDebtCurrency === 'USD'
                          ? 'bg-green-600 text-white shadow-lg shadow-green-500/50 border border-green-400'
                          : 'bg-white/10 text-gray-300 border border-white/10 hover:bg-white/20'
                      }`}
                    >
                      $ Dollar
                    </button>
                    <button
                      onClick={() => setPayDebtCurrency('UZS')}
                      className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                        payDebtCurrency === 'UZS'
                          ? 'bg-green-600 text-white shadow-lg shadow-green-500/50 border border-green-400'
                          : 'bg-white/10 text-gray-300 border border-white/10 hover:bg-white/20'
                      }`}
                    >
                      so'm So'm
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    To'lov Summasi ({payDebtCurrency === 'USD' ? '$' : 'so\'m'})
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={payDebtAmount}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setPayDebtAmount(value)
                      }
                    }}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-500 transition-all backdrop-blur-sm text-lg font-semibold"
                    placeholder={payDebtCurrency === 'USD' ? '0.00' : '0'}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowPayDebtModal(false)
                    setPayDebtAmount('')
                    setPayDebtCurrency('USD')
                    setError(null)
                  }}
                  className="flex-1 px-4 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition-all text-gray-300 font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handlePayDebt}
                  disabled={isSubmitting || !payDebtAmount}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? 'Jarayonda...' : 'To\'lash'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="fixed bottom-4 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-green-500/50 animate-pulse z-50 backdrop-blur-sm border border-green-500/30">
            ✓ Muvaffaqiyatli yakunlandi!
          </div>
        )}
      </div>
    </CashierLayout>
  )
}
