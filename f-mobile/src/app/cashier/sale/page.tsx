'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CashierLayout from '@/components/layouts/CashierLayout'
import { getProducts, getCustomer, createSale } from '@/lib/api'
import { ShoppingCart, Plus, Trash2, Search, X, Check, ArrowLeft } from 'lucide-react'

interface Product {
  id: string
  name: string
  category: string
  sellPrice: number
  costPrice: number
  discountPrice?: number
  stock: number
  barcode?: string
  imei?: string
  imeiList?: Array<{ imei: string; used: boolean }>
}

interface Customer {
  _id: string
  name: string
  phone: string
  debt?: number
}

interface SaleItem {
  id: string
  productId: string
  productName: string
  imei: string
  costPrice: number
  originalPrice: number
  salePrice: number
  quantity: number
  imeiCount: number
}

interface PaymentMethod {
  type: 'cash' | 'click' | 'terminal'
  amount: number
}

interface PaymentState {
  [key: string]: number
}

function SalePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerId = searchParams.get('customerId')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currency] = useState<'USD' | 'UZS'>('USD')
  const [exchangeRate, setExchangeRate] = useState(12500)

  const [cart, setCart] = useState<SaleItem[]>([])
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [notes, setNotes] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingPrice, setEditingPrice] = useState(0)
  const [paymentState, setPaymentState] = useState<PaymentState>({})
  
  // IMEI selection state
  const [showImeiSelection, setShowImeiSelection] = useState(false)
  const [selectedProductForImei, setSelectedProductForImei] = useState<Product | null>(null)
  const [selectedImeiForCart, setSelectedImeiForCart] = useState<string | null>(null)
  const [quantityForCart, setQuantityForCart] = useState(1)

  const fetchExchangeRate = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
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

  const convertPrice = (priceInUsd?: number): number => {
    if (!priceInUsd || isNaN(priceInUsd)) return 0
    if (currency === 'USD') return priceInUsd
    return priceInUsd * exchangeRate
  }

  const formatPrice = (price?: number): string => {
    if (!price || isNaN(price)) return '0'
    if (currency === 'USD') return `${price.toFixed(2)}`
    return `${Math.floor(price).toLocaleString('uz-UZ')} so'm`
  }

  const filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase().trim()
    
    // Search by name
    const nameMatch = !searchLower || p.name.toLowerCase().includes(searchLower)
    
    // Search by IMEI in imeiList (only available ones)
    const imeiListMatch = !searchLower || (p.imeiList && p.imeiList.some(item => item.imei.toLowerCase().includes(searchLower) && !item.used))
    
    // Search by IMEI string field (comma-separated)
    const imeiStringMatch = !searchLower || (p.imei && p.imei.toLowerCase().includes(searchLower))
    
    // Check if product has any IMEI available
    const hasAvailableImei = (p.imeiList && p.imeiList.some(item => !item.used)) || (p.imei && p.imei.trim() !== '')
    
    return hasAvailableImei && (nameMatch || imeiListMatch || imeiStringMatch)
  })

  const totalAmount = cart.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0)
  const totalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0)
  
  // Calculate debt based on payment methods
  let finalDebt = 0;
  const hasCashPayment = paymentMethods.some(m => m.type === 'cash');
  
  if (hasCashPayment) {
    // If cash payment exists, debt = totalAmount - totalPaid
    finalDebt = Math.max(0, totalAmount - totalPaid);
  } else if (paymentMethods.length > 0) {
    // If only Click/Terminal, all amount is debt
    finalDebt = totalAmount;
  } else {
    // No payment methods = all debt
    finalDebt = totalAmount;
  }

  const handleAddToCart = (product: Product, imei?: string, quantity: number = 1) => {
    // Get available IMEIs from both sources
    let availableImeis: string[] = []
    
    if (product.imeiList && product.imeiList.length > 0) {
      availableImeis = product.imeiList
        .filter(item => !item.used)
        .map(item => item.imei)
    } else if (product.imei && product.imei.trim() !== '') {
      availableImeis = product.imei
        .split(',')
        .map(i => i.trim())
        .filter(i => i !== '')
    }
    
    if (availableImeis.length === 0) {
      setError('Bu mahsulotning bo\'sh IMEKasi yo\'q')
      return
    }

    const selectedImei = imei || availableImeis[0]
    if (!selectedImei) {
      setError('Bu mahsulotning IMEKasi yo\'q')
      return
    }

    // Always add as new item with unique IMEI (don't merge quantities)
    // Each IMEI gets its own card with quantity 1
    setCart([...cart, {
      id: Math.random().toString(),
      productId: product.id,
      productName: product.name,
      imei: selectedImei,
      costPrice: product.costPrice,
      originalPrice: product.sellPrice,
      salePrice: product.sellPrice,
      quantity: 1, // Always 1 per IMEI
      imeiCount: 1 // Always 1 per IMEI
    }])
    
    setSearchTerm('')
    setError(null)
  }

  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const handleUpdatePrice = (itemId: string, newPrice: number) => {
    const item = cart.find(i => i.id === itemId)
    if (!item) return

    setCart(cart.map(i =>
      i.id === itemId
        ? { ...i, salePrice: newPrice }
        : i
    ))
    setEditingItemId(null)
    setError(null)
  }

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

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      setError('Savatcha bo\'sh')
      return
    }

    // If only cash payment, check if paid amount is enough
    const hasCashPayment = paymentMethods.some(m => m.type === 'cash');
    
    // Validation: either have payment methods or it's a debt sale
    if (paymentMethods.length === 0 && !selectedCustomer) {
      setError('Tolov turini tanlang yoki mijoz tanlang (qarz uchun)')
      return
    }
    
    if (hasCashPayment && totalPaid < totalAmount) {
      setError('To\'lov miqdori yetarli emas')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const saleData = {
      branch: localStorage.getItem('branchId') || '507f1f77bcf86cd799439011',
      customer: selectedCustomer?._id || null,
      items: cart.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.salePrice,
        originalPrice: item.originalPrice,
        salePrice: item.salePrice,
        imei: item.imei,
        total: item.salePrice * item.quantity
      })),
      totalAmount,
      paidAmount: totalPaid,
      change: Math.max(0, totalPaid - totalAmount),
      currency: 'USD',
      paymentMethods,
      notes
    }

    const response = await createSale(saleData)

    if (response.success) {
      setSuccess('Savdo muvaffaqiyatli yakunlandi!')
      setCart([])
      setPaymentMethods([])
      setNotes('')
      setShowPayment(false)
      setTimeout(() => {
        setSuccess(null)
        router.push('/cashier/history')
      }, 2000)
    } else {
      setError(response.error || 'Savdo yakunlanishda xato')
    }

    setIsSubmitting(false)
  }

  useEffect(() => {
    const fetchData = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('cashierToken')
        console.log('[SALE PAGE] Token exists:', !!token)
        if (!token) {
          router.push('/cashier/login')
          return
        }

        // Fetch current user to get their branch
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        try {
          console.log('[SALE PAGE] Fetching user data from /auth/me...')
          const userResponse = await fetch(`${apiUrl}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          const userData = await userResponse.json()
          console.log('[SALE PAGE] User data response:', userData)
          
          let userBranchId = null
          if (userData.success && userData.data?.branch) {
            // Branch can be ObjectId string or populated object
            userBranchId = typeof userData.data.branch === 'string' 
              ? userData.data.branch 
              : userData.data.branch._id || userData.data.branch.id
            console.log('[SALE PAGE] ✅ User branch from API:', userBranchId)
          console.log('[SALE PAGE] User branch type:', typeof userBranchId)
          } else {
            console.log('[SALE PAGE] ⚠️ No branch in user data')
          }
          
          // Fallback to localStorage if API fails
          if (!userBranchId) {
            userBranchId = localStorage.getItem('branchId')
            console.log('[SALE PAGE] Using branchId from localStorage:', userBranchId)
          }
        
          console.log('[SALE PAGE] Final userBranchId:', userBranchId)
          
          const productsRes = await getProducts()
          console.log('[SALE PAGE] All products count:', productsRes.data?.length)
          if (productsRes.data && productsRes.data.length > 0) {
            console.log('[SALE PAGE] First product sample:', productsRes.data[0])
          }

          if (productsRes.success && productsRes.data) {
            const filteredByBranch = userBranchId 
              ? (productsRes.data as Product[]).filter(p => {
                  const productBranch = (p as any).branch
                  // Branch can be ObjectId string or object
                  const productBranchId = typeof productBranch === 'string' 
                    ? productBranch 
                    : (productBranch?._id || productBranch?.id || productBranch?.toString())
                  
                  const branchMatch = productBranchId === userBranchId
                  console.log('[SALE PAGE] Checking product:', { 
                    name: p.name, 
                    productBranch: productBranch,
                    productBranchId, 
                    productBranchIdType: typeof productBranchId,
                    userBranchId,
                    userBranchIdType: typeof userBranchId,
                    matches: branchMatch,
                    strictEqual: productBranchId === userBranchId,
                    looseEqual: productBranchId == userBranchId
                  })
                  return branchMatch
                })
              : productsRes.data as Product[]
            
            console.log('[SALE PAGE] ✅ Filtered products for branch:', filteredByBranch.length)
            setProducts(filteredByBranch)
          }
        } catch (err) {
          console.error('[SALE PAGE] ❌ Error fetching user/products:', err)
          setError('Ma\'lumotlarni yuklashda xato')
        }

        if (customerId) {
          const customerRes = await getCustomer(customerId)
          if (customerRes.success && customerRes.data) {
            setSelectedCustomer(customerRes.data as Customer)
          }
        }
      }
    }

    fetchData()
  }, [router, customerId])

  return (
    <CashierLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft size={24} className="text-teal-400" />
            </button>
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">Savdo</h1>
              {selectedCustomer && (
                <p className="text-gray-400 mt-1">{selectedCustomer.name} uchun savdo</p>
              )}
            </div>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 backdrop-blur-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/20 rounded">
                <X size={20} />
              </button>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 backdrop-blur-sm flex items-center gap-2">
              <Check size={20} />
              <span>{success}</span>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-4 w-5 h-5 text-teal-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Mahsulot nomi, IMEKA yoki barkodini kiriting..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm text-white placeholder-gray-400 transition-all"
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
            {filteredProducts.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-400">
                {searchTerm ? 'Mahsulot topilmadi' : products.length === 0 ? 'Bu filialda mahsulot yo\'q' : 'Mahsulot topilmadi'}
              </div>
            ) : (
              filteredProducts.map(product => {
                // Handle both imeiList and imei string field
                const hasImeiList = product.imeiList && product.imeiList.length > 0
                const hasImeiString = product.imei && product.imei.trim() !== ''
                
                const searchLower = searchTerm.toLowerCase()
                
                // Get available IMEIs
                let availableImeis: string[] = []
                
                if (hasImeiList) {
                  availableImeis = product.imeiList
                    .filter(item => !item.used)
                    .map(item => item.imei)
                } else if (hasImeiString) {
                  availableImeis = product.imei
                    .split(',')
                    .map(i => i.trim())
                    .filter(i => i !== '')
                }
                
                if (availableImeis.length === 0) {
                  return null
                }
                
                const availableCount = availableImeis.length
                const firstAvailableImei = availableImeis[0] || ''
                
                // Check if search matches this product
                const nameMatch = product.name.toLowerCase().includes(searchLower)
                const imeiMatch = availableImeis.some(imei => imei.toLowerCase().includes(searchLower))
                
                if (!nameMatch && !imeiMatch) {
                  return null
                }
                
                return (
                  <div
                    key={product.id}
                    className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-4 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">{product.category}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Prices */}
                      <div className="bg-white/5 rounded p-2 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Olish:</span>
                          <span className="text-yellow-400 font-semibold">${product.costPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Sotish:</span>
                          <span className="text-green-400 font-semibold">${product.sellPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-xs text-gray-400 mb-1">IMEKA:</p>
                        <p className="text-sm font-mono text-teal-300 break-all">{firstAvailableImei}</p>
                      </div>

                      {/* Available Count */}
                      <div className="bg-cyan-500/20 border border-cyan-500/30 rounded p-2 text-center">
                        <p className="text-xs text-cyan-300">Mavjud: <span className="font-bold">{availableCount} ta</span></p>
                      </div>

                      {/* Quantity Input */}
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max={availableCount}
                          defaultValue="1"
                          id={`qty-${product.id}`}
                          className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Miqdor"
                          onChange={(e) => {
                            const inputValue = e.target.value
                            let value = parseInt(inputValue)
                            if (!isNaN(value) && value > availableCount) {
                              e.target.value = availableCount.toString()
                            }
                          }}
                          onBlur={(e) => {
                            let value = parseInt(e.target.value)
                            if (isNaN(value) || value < 1) {
                              value = 1
                            } else if (value > availableCount) {
                              value = availableCount
                            }
                            e.target.value = value.toString()
                          }}
                        />
                        <button
                          onClick={() => {
                            const qtyInput = document.getElementById(`qty-${product.id}`) as HTMLInputElement
                            const qty = parseInt(qtyInput?.value || '1') || 1
                            if (qty > availableCount) {
                              setError(`Maksimum ${availableCount} ta mavjud`)
                              return
                            }
                            // Open IMEI selection dialog
                            setSelectedProductForImei(product)
                            setQuantityForCart(qty)
                            setShowImeiSelection(true)
                          }}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded text-white text-sm font-semibold transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-sm sticky top-24 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* Cart Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <ShoppingCart size={20} className="text-slate-900" />
              </div>
              <div>
                <h2 className="font-bold text-white">Savatcha</h2>
                <p className="text-sm text-gray-400">{cart.length} mahsulot</p>
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-3">
              {cart.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Savatcha bo\'sh</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm line-clamp-2">{item.productName}</p>
                        <p className="text-xs text-gray-400 mt-1">IMEKA: {item.imei}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="p-1 hover:bg-red-500/20 rounded transition"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>

                    {/* Price Info */}
                    <div className="bg-white/5 rounded p-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Olish:</span>
                        <span className="text-yellow-400 font-semibold">
                          {currency === 'UZS' ? `${Math.floor(item.costPrice * exchangeRate).toLocaleString('uz-UZ')} so'm` : `$${item.costPrice.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sotish:</span>
                        <span className="text-green-400 font-semibold">
                          {currency === 'UZS' ? `${Math.floor(item.originalPrice * exchangeRate).toLocaleString('uz-UZ')} so'm` : `$${item.originalPrice.toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-2 bg-white/5 rounded p-2">
                      <span className="text-xs text-gray-400">Miqdor:</span>
                      <input
                        type="number"
                        min="1"
                        max={item.imeiCount}
                        defaultValue={item.quantity}
                        id={`qty-cart-${item.id}`}
                        onChange={(e) => {
                          let value = parseInt(e.target.value)
                          if (isNaN(value) || value < 1) {
                            value = 1
                            e.target.value = '1'
                          } else if (value > item.imeiCount) {
                            value = item.imeiCount
                            e.target.value = item.imeiCount.toString()
                          }
                          setCart(cart.map(i =>
                            i.id === item.id
                              ? { ...i, quantity: value }
                              : i
                          ))
                        }}
                        className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Miqdor"
                      />
                      <span className="text-xs text-gray-400">/ {item.imeiCount}</span>
                    </div>

                    {/* Sale Price */}
                    {editingItemId === item.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editingPrice}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              setEditingPrice(value === '' ? 0 : parseFloat(value))
                            }
                          }}
                          className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="0.00"
                        />
                        <button
                          onClick={() => handleUpdatePrice(item.id, editingPrice)}
                          className="px-2 py-1 bg-green-500/20 hover:bg-green-500/40 rounded text-green-400 text-sm transition"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingItemId(item.id)
                          setEditingPrice(item.salePrice)
                        }}
                        className="w-full text-left px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-teal-300 text-sm transition"
                      >
                        Tushib berish: {currency === 'UZS' ? `${Math.floor(item.salePrice * exchangeRate).toLocaleString('uz-UZ')} so'm` : `$${item.salePrice.toFixed(2)}`}
                      </button>
                    )}

                    <div className="text-right">
                      <p className="font-bold text-teal-300">{currency === 'UZS' ? `${Math.floor(item.salePrice * item.quantity * exchangeRate).toLocaleString('uz-UZ')} so'm` : `$${(item.salePrice * item.quantity).toFixed(2)}`}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Divider */}
            {cart.length > 0 && <div className="border-t border-white/10"></div>}

            {/* Totals */}
            {cart.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Jami:</span>
                  <span className="font-bold text-teal-300">${totalAmount.toFixed(2)}</span>
                </div>

                {!showPayment ? (
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-lg hover:shadow-lg hover:shadow-teal-500/50 transition-all font-semibold"
                  >
                    To'lovga o'tish
                  </button>
                ) : (
                  <div className="space-y-3 bg-white/5 border border-white/10 rounded-lg p-4">
                    {/* Payment Methods */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Tolov Turlari (maksimum 2 ta)
                        </label>
                      </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                        {['cash', 'click', 'terminal'].map(type => {
                          const isSelected = paymentMethods.some(m => m.type === type as any)
                          const typeText = type === 'cash' ? 'Naqd' : type === 'click' ? 'Click' : 'Terminal'
                          return (
                            <button
                              key={type}
                              onClick={() => {
                                if (isSelected) {
                                  handleRemovePaymentMethod(paymentMethods.findIndex(m => m.type === type as any))
                                } else {
                                  handleAddPaymentMethod(type as any)
                                }
                              }}
                              className={`py-2 px-3 rounded-lg font-semibold transition-all ${
                                isSelected
                                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/50 border border-teal-400'
                                  : 'bg-white/10 text-gray-300 border border-white/10 hover:bg-white/20'
                              }`}
                            >
                              {typeText}
                            </button>
                          )
                        })}
                      </div>

                      {/* Payment Amounts */}
                      <div className="space-y-2">
                        {paymentMethods.map((method, index) => {
                          const typeText = method.type === 'cash' ? 'Naqd' : method.type === 'click' ? 'Click' : 'Terminal'
                          const displayAmount = currency === 'UZS' ? (paymentState[`${method.type}_${index}`] || 0) : method.amount
                          return (
                            <div key={index} className="flex gap-2">
                              <label className="flex-1 text-sm text-gray-400 flex items-center">
                                {typeText}:
                              </label>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={displayAmount}
                                onChange={(e) => {
                                  const value = e.target.value
                                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    const numValue = value === '' ? 0 : parseFloat(value)
                                    setPaymentState({
                                      ...paymentState,
                                      [`${method.type}_${index}`]: numValue
                                    })
                                    const amountInUsd = currency === 'UZS' ? numValue / exchangeRate : numValue
                                    handleUpdatePaymentAmount(index, amountInUsd)
                                  }
                                }}
                                className="w-32 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder={currency === 'UZS' ? '0' : '0.00'}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Debt Display */}
                    <div className={`border rounded-lg p-3 text-center ${finalDebt > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                      <p className="text-gray-400 text-xs mb-1">{finalDebt > 0 ? '❌ Qarz' : '✅ To\'langan'}</p>
                      <p className={`font-bold text-lg ${finalDebt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {currency === 'UZS' ? `${Math.floor(Math.max(0, finalDebt) * exchangeRate).toLocaleString('uz-UZ')} so'm` : `${Math.max(0, finalDebt).toFixed(2)}`}
                      </p>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Izoh (ixtiyoriy)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                        rows={2}
                        placeholder="Izoh..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPayment(false)}
                        className="flex-1 px-3 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-all text-gray-300 font-medium text-sm"
                      >
                        Bekor qilish
                      </button>
                      <button
                        onClick={handleCompleteSale}
                        disabled={isSubmitting || paymentMethods.length === 0}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Check size={16} />
                        {isSubmitting ? 'Yakunlanmoqda...' : 'Yakunlash'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* IMEI Selection Modal */}
        {showImeiSelection && selectedProductForImei && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-2xl max-w-md w-full border border-slate-700/50">
              <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
                <h2 className="text-2xl font-bold text-white">📱 IMEI Tanlang</h2>
                <button
                  onClick={() => {
                    setShowImeiSelection(false)
                    setSelectedProductForImei(null)
                    setSelectedImeiForCart(null)
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-300 mb-2">Mahsulot: <span className="font-bold text-white">{selectedProductForImei.name}</span></p>
                  <p className="text-sm text-gray-300">Miqdor: <span className="font-bold text-cyan-300">{quantityForCart} ta</span></p>
                </div>

                <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                  {selectedProductForImei.imeiList && selectedProductForImei.imeiList.length > 0 ? (
                    selectedProductForImei.imeiList
                      .filter(item => !item.used)
                      .map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedImeiForCart(item.imei)
                            // Add to cart for each quantity
                            for (let i = 0; i < quantityForCart; i++) {
                              handleAddToCart(selectedProductForImei, item.imei, 1)
                            }
                            setShowImeiSelection(false)
                            setSelectedProductForImei(null)
                            setSelectedImeiForCart(null)
                            setQuantityForCart(1)
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded transition ${
                            selectedImeiForCart === item.imei
                              ? 'bg-teal-600 border border-teal-400'
                              : 'bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700'
                          }`}
                        >
                          <span className="text-blue-400 font-bold min-w-8">{index + 1}.</span>
                          <span className="text-gray-200 font-mono text-sm flex-1 break-all">{item.imei}</span>
                          {selectedImeiForCart === item.imei && <Check size={16} className="text-teal-300" />}
                        </button>
                      ))
                  ) : selectedProductForImei.imei && selectedProductForImei.imei.trim() !== '' ? (
                    selectedProductForImei.imei.split(',').map((imei, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImeiForCart(imei.trim())
                          // Add to cart for each quantity
                          for (let i = 0; i < quantityForCart; i++) {
                            handleAddToCart(selectedProductForImei, imei.trim(), 1)
                          }
                          setShowImeiSelection(false)
                          setSelectedProductForImei(null)
                          setSelectedImeiForCart(null)
                          setQuantityForCart(1)
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded transition ${
                          selectedImeiForCart === imei.trim()
                            ? 'bg-teal-600 border border-teal-400'
                            : 'bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700'
                        }`}
                      >
                        <span className="text-blue-400 font-bold min-w-8">{index + 1}.</span>
                        <span className="text-gray-200 font-mono text-sm flex-1 break-all">{imei.trim()}</span>
                        {selectedImeiForCart === imei.trim() && <Check size={16} className="text-teal-300" />}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">IMEI raqamlari yo'q</p>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-700/50">
                <button
                  onClick={() => {
                    setShowImeiSelection(false)
                    setSelectedProductForImei(null)
                    setSelectedImeiForCart(null)
                  }}
                  className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded text-white font-semibold transition"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CashierLayout>
  )
}

export default function SalePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SalePageContent />
    </Suspense>
  )
}

