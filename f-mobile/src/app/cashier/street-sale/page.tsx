'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CashierLayout from '@/components/layouts/CashierLayout'
import { Plus, Trash2, Search, Package, Check, X, ArrowLeft } from 'lucide-react'
import { getProducts, createSale } from '@/lib/api'

interface Product {
  id: string
  name: string
  costPrice: number
  sellPrice: number
  stock: number
  imei?: string
  imeiList?: Array<{ imei: string; used: boolean }>
  branch?: string
  currency?: 'USD' | 'UZS'
  sellCurrency?: 'USD' | 'UZS'
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
  currency: 'USD' | 'UZS'
  originalCurrency: 'USD' | 'UZS'
}

interface PaymentMethod {
  type: 'cash' | 'debt' | 'click' | 'terminal'
  amount: number
}

export default function StreetSalePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingPrice, setEditingPrice] = useState(0)
  const [cartQuantities, setCartQuantities] = useState<{ [key: string]: number }>({})
  const [quantityInputs, setQuantityInputs] = useState<{ [key: string]: string }>({})
  const [exchangeRate, setExchangeRate] = useState(12500)
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
  
  const getConvertedPrice = (price: number, fromCurrency: 'USD' | 'UZS', toCurrency: 'USD' | 'UZS'): number => {
    if (fromCurrency === toCurrency) return price
    if (fromCurrency === 'USD' && toCurrency === 'UZS') {
      return price * exchangeRate
    }
    if (fromCurrency === 'UZS' && toCurrency === 'USD') {
      return price / exchangeRate
    }
    return price
  }

  const fetchProducts = async () => {
    setError(null)
    try {
      // Fetch current user to get their branch
      const token = localStorage.getItem('cashierToken')
      if (!token) return
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      
      let userBranchId = null
      try {
        console.log('[STREET SALE] Fetching user data from /auth/me...')
        const userResponse = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        const userData = await userResponse.json()
        console.log('[STREET SALE] User data response:', userData)
        
        if (userData.success && userData.data?.branch) {
          userBranchId = typeof userData.data.branch === 'string' 
            ? userData.data.branch 
            : userData.data.branch._id || userData.data.branch.id
          console.log('[STREET SALE] ✅ User branch from API:', userBranchId)
        } else {
          console.log('[STREET SALE] ⚠️ No branch in user data')
        }
      } catch (err) {
        console.error('[STREET SALE] Error fetching user:', err)
      }
      
      // Fallback to localStorage if API fails
      if (!userBranchId) {
        userBranchId = localStorage.getItem('branchId')
        console.log('[STREET SALE] Using branchId from localStorage:', userBranchId)
      }
      
      console.log('[STREET SALE] Final userBranchId:', userBranchId)
      
      const response = await getProducts()
      console.log('[STREET SALE] All products count:', response.data?.length)
      
      if (response.success && response.data) {
        const productList = Array.isArray(response.data) ? response.data : []
        
        // Filter by branch
        const filteredByBranch = userBranchId 
          ? productList.filter(p => {
              const productBranch = (p as any).branch
              const productBranchId = typeof productBranch === 'string' 
                ? productBranch 
                : (productBranch?._id || productBranch?.id || productBranch?.toString())
              
              const branchMatch = productBranchId === userBranchId
              console.log('[STREET SALE] Product:', { 
                name: p.name, 
                productBranchId, 
                userBranchId, 
                matches: branchMatch 
              })
              return branchMatch
            })
          : productList
        
        console.log('[STREET SALE] ✅ Filtered products for branch:', filteredByBranch.length)
        setProducts(filteredByBranch)
      } else {
        setError(response.error || 'Mahsulotlarni yuklashda xato')
      }
    } catch (err) {
      console.error('[STREET SALE] Fetch error:', err)
      setError('Ma\'lumotlarni yuklashda xato')
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cashierToken')
      if (!token) {
        router.push('/')
      } else {
        fetchProducts()
        fetchExchangeRate()
      }
    }
  }, [router])
  
  const fetchExchangeRate = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/exchange-rate/current`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setExchangeRate(data.data.rate)
        console.log('[STREET SALE] Exchange rate:', data.data.rate)
      }
    } catch (err) {
      console.error('[STREET SALE] Exchange rate fetch error:', err)
    }
  }

  const filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase().trim()
    
    // If no search term, show all products with available IMEI
    if (!searchLower) {
      const hasAvailableImei = (p.imeiList && p.imeiList.some((item: any) => !item.used)) || 
                               (p.imei && p.imei.trim() !== '')
      return hasAvailableImei
    }
    
    // If search term exists, filter by name or IMEI
    const nameMatch = p.name.toLowerCase().includes(searchLower)
    
    const imeiListMatch = p.imeiList && p.imeiList.some((item: any) => 
      item.imei.toLowerCase().includes(searchLower) && !item.used
    )
    
    const imeiStringMatch = p.imei && p.imei.toLowerCase().includes(searchLower)
    
    const hasAvailableImei = (p.imeiList && p.imeiList.some((item: any) => !item.used)) || 
                             (p.imei && p.imei.trim() !== '')
    
    return hasAvailableImei && (nameMatch || imeiListMatch || imeiStringMatch)
  })
  
  console.log('[STREET SALE] filteredProducts count:', filteredProducts.length)

  // Calculate total in mixed currencies - convert all to UZS for calculation
  const totalInUZS = saleItems.reduce((sum, item) => {
    const itemTotal = item.salePrice * item.quantity
    if (item.currency === 'USD') {
      return sum + (itemTotal * exchangeRate)
    }
    return sum + itemTotal
  }, 0)
  
  // Determine display currency based on cart items
  const hasUSD = saleItems.some(item => item.currency === 'USD')
  const hasUZS = saleItems.some(item => item.currency === 'UZS')
  const displayInUSD = hasUSD && !hasUZS // Show in USD only if all items are USD
  
  const totalAmount = displayInUSD ? totalInUZS / exchangeRate : totalInUZS
  const totalCurrency: 'USD' | 'UZS' = displayInUSD ? 'USD' : 'UZS'
  
  const totalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0)
  const change = totalPaid - totalAmount
  const finalDebt = Math.max(0, totalAmount - totalPaid)

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

    const availableImei = imei || availableImeis[0]
    if (!availableImei) {
      setError('Bu mahsulotning IMEKasi yo\'q')
      return
    }

    // Get selected currency for this product
    const originalCurrency = product.sellCurrency || product.currency || 'UZS'
    const selectedCurrency = getProductDisplayCurrency(product.id, originalCurrency)
    
    // Convert prices to selected currency
    const convertedSellPrice = getConvertedPrice(product.sellPrice, originalCurrency, selectedCurrency)
    const convertedCostPrice = getConvertedPrice(product.costPrice, originalCurrency, selectedCurrency)

    // Check if same product with same IMEI already exists in cart
    const existingItem = saleItems.find(item => item.productId === product.id && item.imei === availableImei)
    
    if (existingItem) {
      // Update quantity instead of adding new item
      setSaleItems(saleItems.map(item =>
        item.id === existingItem.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      // Add new item
      setSaleItems([...saleItems, {
        id: Math.random().toString(),
        productId: product.id,
        productName: product.name,
        imei: availableImei,
        costPrice: convertedCostPrice,
        originalPrice: convertedSellPrice,
        salePrice: convertedSellPrice,
        quantity: quantity,
        imeiCount: quantity,
        currency: selectedCurrency,
        originalCurrency: originalCurrency
      }])
    }
    setSearchTerm('')
    setError(null)
  }

  const handleRemoveFromCart = (itemId: string) => {
    setSaleItems(saleItems.filter(item => item.id !== itemId))
  }

  const handleUpdatePrice = (itemId: string, newPrice: number) => {
    const item = saleItems.find(i => i.id === itemId)
    if (!item) return

    setSaleItems(saleItems.map(i =>
      i.id === itemId
        ? { ...i, salePrice: newPrice }
        : i
    ))
    setEditingItemId(null)
    setError(null)
  }

  const handleAddPaymentMethod = (type: 'cash' | 'debt' | 'click' | 'terminal') => {
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
    if (saleItems.length === 0) {
      setError('Savatcha bo\'sh')
      return
    }

    if (paymentMethods.length === 0) {
      setError('Tolov turini tanlang')
      return
    }

    if (totalPaid < totalAmount) {
      setError('To\'lov miqdori yetarli emas')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const saleData = {
      branch: localStorage.getItem('branchId') || '507f1f77bcf86cd799439011',
      customer: null, // Ko'chaga sotuv - mijoz yo'q
      items: saleItems.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.salePrice,
        originalPrice: item.originalPrice,
        salePrice: item.salePrice,
        imei: item.imei,
        currency: item.currency,
        total: item.salePrice * item.quantity
      })),
      totalAmount,
      paidAmount: totalPaid,
      change: Math.max(0, change),
      currency: totalCurrency,
      paymentMethods,
      notes: 'Ko\'chaga sotuv'
    }

    const response = await createSale(saleData)

    if (response.success) {
      setSuccess('Savdo muvaffaqiyatli yakunlandi!')
      setSaleItems([])
      setPaymentMethods([])
      setNotes('')
      setTimeout(() => {
        setSuccess(null)
        router.push('/cashier/history')
      }, 2000)
    } else {
      setError(response.error || 'Savdo yakunlanishda xato')
    }

    setIsSubmitting(false)
  }

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
              <ArrowLeft size={24} className="text-orange-400" />
            </button>
            <div className="flex-1">
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400">Ko'chaga Sotuv</h1>
              <p className="text-gray-400 mt-1">Noma'lum odamga sotuv</p>
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
            <Search className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Mahsulot nomi, IMEKA yoki barkodini kiriting..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm text-white placeholder-gray-400 transition-all"
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
            {filteredProducts.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-400">
                {searchTerm ? 'Mahsulot topilmadi' : 'Qidirish uchun IMEKA kiriting'}
              </div>
            ) : (
              filteredProducts.flatMap(product => {
                // Handle both imeiList and imei string field
                let imeiGroups: { [key: string]: number } = {}
                
                if (product.imeiList && product.imeiList.length > 0) {
                  // Use imeiList
                  const searchLower = searchTerm.toLowerCase()
                  product.imeiList.forEach(item => {
                    if (!item.used && (!searchTerm || item.imei.toLowerCase().includes(searchLower))) {
                      imeiGroups[item.imei] = (imeiGroups[item.imei] || 0) + 1
                    }
                  })
                } else if (product.imei && product.imei.trim() !== '') {
                  // Use imei string field (comma-separated)
                  const imeis = product.imei.split(',').map(i => i.trim()).filter(i => i !== '')
                  const searchLower = searchTerm.toLowerCase()
                  
                  imeis.forEach(imei => {
                    if (!searchTerm || imei.toLowerCase().includes(searchLower)) {
                      imeiGroups[imei] = (imeiGroups[imei] || 0) + 1
                    }
                  })
                } else {
                  // No IMEI data
                  return []
                }
                
                // Create one card per unique IMEI
                return Object.entries(imeiGroups).map(([imei, count]) => (
                  <div
                    key={`${product.id}-${imei}`}
                    className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-4 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-white group-hover:text-orange-300 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Currency Selection Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setProductCurrencies(prev => ({ ...prev, [product.id]: 'USD' }))}
                          className={`py-1 px-2 rounded text-xs font-semibold transition ${
                            getProductDisplayCurrency(product.id, product.sellCurrency || product.currency || 'UZS') === 'USD'
                              ? 'bg-green-600 text-white border border-green-500'
                              : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
                          }`}
                        >
                          $ Dollar
                        </button>
                        <button
                          onClick={() => setProductCurrencies(prev => ({ ...prev, [product.id]: 'UZS' }))}
                          className={`py-1 px-2 rounded text-xs font-semibold transition ${
                            getProductDisplayCurrency(product.id, product.sellCurrency || product.currency || 'UZS') === 'UZS'
                              ? 'bg-blue-600 text-white border border-blue-500'
                              : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
                          }`}
                        >
                          so'm So'm
                        </button>
                      </div>
                      
                      {(() => {
                        const originalCurrency = product.sellCurrency || product.currency || 'UZS'
                        const displayCurrency = getProductDisplayCurrency(product.id, originalCurrency)
                        const displaySellPrice = getConvertedPrice(product.sellPrice, originalCurrency, displayCurrency)
                        const displayCostPrice = getConvertedPrice(product.costPrice, originalCurrency, displayCurrency)
                        
                        return (
                          <>
                            <p className="text-2xl font-bold text-orange-300">
                              {formatPrice(displaySellPrice, displayCurrency)}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-blue-500/20 border border-blue-500/30 rounded p-2">
                                <p className="text-gray-400">Olish:</p>
                                <p className="text-blue-300 font-semibold">
                                  {formatPrice(displayCostPrice, displayCurrency)}
                                </p>
                              </div>
                              <div className="bg-green-500/20 border border-green-500/30 rounded p-2">
                                <p className="text-gray-400">Sotish:</p>
                                <p className="text-green-300 font-semibold">
                                  {formatPrice(displaySellPrice, displayCurrency)}
                                </p>
                              </div>
                            </div>
                            
                            {originalCurrency !== displayCurrency && (
                              <div className="text-xs text-gray-400 text-center bg-purple-500/10 border border-purple-500/20 rounded p-1">
                                Kurs: 1$ = {exchangeRate.toLocaleString('uz-UZ')} so'm
                              </div>
                            )}
                          </>
                        )
                      })()}
                      
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-xs text-gray-400 mb-1">IMEKA:</p>
                        <p className="text-sm font-mono text-orange-300 break-all">{imei}</p>
                      </div>

                      {/* Available Count */}
                      <div className="bg-orange-500/20 border border-orange-500/30 rounded p-2 text-center">
                        <p className="text-xs text-orange-300">Mavjud: <span className="font-bold">{count} ta</span></p>
                      </div>

                      {/* Quantity Input - only show if count > 1 */}
                      {count > 1 ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            max={count}
                            defaultValue="1"
                            id={`qty-${product.id}-${imei}`}
                            className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Miqdor"
                            onChange={(e) => {
                              const inputValue = e.target.value
                              let value = parseInt(inputValue)
                              if (!isNaN(value) && value > count) {
                                e.target.value = count.toString()
                              }
                            }}
                            onBlur={(e) => {
                              let value = parseInt(e.target.value)
                              if (isNaN(value) || value < 1) {
                                value = 1
                              } else if (value > count) {
                                value = count
                              }
                              e.target.value = value.toString()
                            }}
                          />
                          <button
                            onClick={() => {
                              const qtyInput = document.getElementById(`qty-${product.id}-${imei}`) as HTMLInputElement
                              const qty = parseInt(qtyInput?.value || '1') || 1
                              if (qty > count) {
                                setError(`Maksimum ${count} ta mavjud`)
                                return
                              }
                              handleAddToCart(product, imei, qty)
                            }}
                            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white text-sm font-semibold transition"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product, imei, 1)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white text-sm font-semibold transition"
                        >
                          <Plus size={16} />
                          Qo'shish
                        </button>
                      )}
                    </div>
                  </div>
                ))
              })
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-sm sticky top-24 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* Cart Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white">Savatcha</h2>
                <p className="text-sm text-gray-400">{saleItems.length} mahsulot</p>
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-3">
              {saleItems.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Savatcha bo\'sh</p>
              ) : (
                saleItems.map(item => (
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

                    {/* Buy and Sell Prices */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded p-2">
                        <p className="text-gray-400">Olish:</p>
                        <p className="text-blue-300 font-semibold">{formatPrice(item.costPrice, item.currency)}</p>
                      </div>
                      <div className="bg-green-500/20 border border-green-500/30 rounded p-2">
                        <p className="text-gray-400">Sotish:</p>
                        <p className="text-green-300 font-semibold">{formatPrice(item.originalPrice, item.currency)}</p>
                      </div>
                    </div>
                    
                    {/* Show currency badge */}
                    <div className="text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        item.currency === 'USD' 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {item.currency === 'USD' ? '$ Dollar' : 'so\'m So\'m'}
                      </span>
                      {item.originalCurrency !== item.currency && (
                        <p className="text-xs text-gray-400 mt-1">
                          Konvertatsiya qilindi
                        </p>
                      )}
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
                          setSaleItems(saleItems.map(i =>
                            i.id === item.id
                              ? { ...i, quantity: value }
                              : i
                          ))
                        }}
                        className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                          className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                        className="w-full text-left px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-orange-300 text-sm transition"
                      >
                        Tushib berish: {formatPrice(item.salePrice, item.currency)}
                      </button>
                    )}

                    <div className="text-right">
                      <p className="font-bold text-orange-300">{formatPrice(item.salePrice * item.quantity, item.currency)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Divider */}
            {saleItems.length > 0 && <div className="border-t border-white/10"></div>}

            {/* Totals */}
            {saleItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Jami:</span>
                  <span className="font-bold text-orange-300">{formatPrice(totalAmount, totalCurrency)}</span>
                </div>

                <div className="space-y-3 bg-white/5 border border-white/10 rounded-lg p-4">
                  {/* Payment Methods */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tolov Turlari (maksimum 2 ta)
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
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
                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/50 border border-orange-400'
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
                        return (
                          <div key={index} className="flex gap-2">
                            <label className="flex-1 text-sm text-gray-400 flex items-center">
                              {typeText}:
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={method.amount}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                  handleUpdatePaymentAmount(index, value === '' ? 0 : parseFloat(value))
                                }
                              }}
                              className="w-32 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="0.00"
                            />
                          </div>
                        )
                      })}
                    </div>

                  </div>
                  {/* Action Buttons */}
                  <button
                    onClick={handleCompleteSale}
                    disabled={isSubmitting || paymentMethods.length === 0}
                    className="w-full px-3 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    {isSubmitting ? 'Yakunlanmoqda...' : 'Yakunlash'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CashierLayout>
  )
}

