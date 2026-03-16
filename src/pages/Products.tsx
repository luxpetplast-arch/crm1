import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../lib/api';
import { Package, Eye, Trash2 } from 'lucide-react';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1); // 1: Asosiy, 2: Qo'shimcha
  const [form, setForm] = useState({
    name: '',
    bagType: '',
    pricePerBag: '',
    // Qo'shimcha - keyinchalik
    minStockLimit: '10',
    optimalStock: '50',
    maxCapacity: '200',
    productionCost: '0',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    api.get('/products').then(({ data }) => setProducts(data));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await api.post('/products', {
        ...form,
        unitsPerBag: 1, // Default qiymat
        minStockLimit: parseInt(form.minStockLimit),
        optimalStock: parseInt(form.optimalStock),
        maxCapacity: parseInt(form.maxCapacity),
        pricePerBag: parseFloat(form.pricePerBag),
        productionCost: parseFloat(form.productionCost),
      });
      setShowForm(false);
      setStep(1);
      setForm({
        name: '',
        bagType: '',
        pricePerBag: '',
        minStockLimit: '10',
        optimalStock: '50',
        maxCapacity: '200',
        productionCost: '0',
      });
      loadProducts();
    } catch (error) {
      console.error('Mahsulot qo\'shishda xatolik');
      alert('Xatolik yuz berdi');
    }
  };

  const handleNext = () => {
    if (!form.name || !form.bagType || !form.pricePerBag) {
      alert('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }
    setStep(2);
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`"${productName}" mahsulotini o'chirishga ishonchingiz komilmi?\n\n⚠️ Diqqat: Mahsulotni o'chirgandan so'ng uni qayta tiklab bo'lmaydi!`)) {
      return;
    }

    try {
      console.log('Attempting to delete product:', productId);
      
      // Avval mahsulot mavjudligini tekshiramiz
      const checkResponse = await api.get(`/products`);
      const productExists = checkResponse.data.some((p: any) => p.id === productId);
      
      if (!productExists) {
        alert('❌ Mahsulot topilmadi! Ro\'yxat yangilanishi mumkin.');
        loadProducts();
        return;
      }
      
      const response = await api.delete(`/products/${productId}`);
      console.log('Delete response:', response);
      loadProducts();
      alert('✅ Mahsulot muvaffaqiyatli o\'chirildi!');
    } catch (error: any) {
      console.error('Mahsulot o\'chirishda xatolik:', error);
      
      let errorMessage = 'Noma\'lum xatolik';
      
      if (error.response) {
        // Server response bor
        console.error('Error response:', error.response.status, error.response.data);
        
        if (error.response.status === 403) {
          errorMessage = 'Sizda mahsulot o\'chirish uchun ruxsat yo\'q. Administrator bilan bog\'laning.';
        } else if (error.response.status === 404) {
          errorMessage = 'Mahsulot topilmadi. Ro\'yxat yangilanishi mumkin.';
          loadProducts(); // Ro'yxatni yangilash
        } else if (error.response.status === 500) {
          errorMessage = 'Server xatoligi. Iltimos, birozdan so\'ng urinib ko\'ring.';
        } else {
          errorMessage = error.response.data?.error || error.response.data?.message || `Server xatolik (${error.response.status})`;
        }
      } else if (error.request) {
        // Server javob bermadi
        errorMessage = 'Serverga ulanib bo\'lmadi. Internet aloqasini tekshiring.';
      } else {
        // Boshqa xatolik
        errorMessage = error.message || 'Xatolik yuz berdi';
      }
      
      alert(`❌ Mahsulot o'chirilmadi!\n\nXatolik: ${errorMessage}\n\nIltimos, administrator bilan bog'laning.`);
    }
  };

  const getStockStatus = (product: any) => {
    // Minimal limit bilan solishtirish
    if (product.currentStock === 0) {
      return { 
        color: 'text-red-600', 
        bgColor: 'bg-red-100 border-2 border-red-300 dark:bg-red-900 dark:text-red-200',
        label: 'Tugagan',
        emoji: '❌'
      };
    }
    
    // Optimal yoki undan ko'p
    if (product.currentStock >= product.optimalStock) {
      return { 
        color: 'text-emerald-600', 
        bgColor: 'bg-emerald-100 border-2 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200',
        label: 'Zo\'r',
        emoji: '💎'
      };
    }
    
    // Optimal va minimal orasida
    if (product.currentStock >= product.minStockLimit) {
      return { 
        color: 'text-green-600', 
        bgColor: 'bg-green-100 border-2 border-green-300 dark:bg-green-900 dark:text-green-200',
        label: 'Yaxshi',
        emoji: '✅'
      };
    }
    
    // Minimal limitdan kam
    return { 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100 border-2 border-orange-300 dark:bg-orange-900 dark:text-orange-200',
      label: 'Kam',
      emoji: '⚠️'
    };
  };

  // Umumiy statistika
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.pricePerBag), 0);
  const lowStockCount = products.filter(p => p.currentStock < p.minStockLimit).length;
  const outOfStockCount = products.filter(p => p.currentStock === 0).length;
  const optimalStockCount = products.filter(p => p.currentStock >= p.optimalStock).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8 text-primary" />
            Mahsulotlar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ombor boshqaruvi va monitoring
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto min-h-[44px]">
          {showForm ? 'Bekor qilish' : 'Mahsulot qo\'shish'}
        </Button>
      </div>

      {/* Umumiy Statistika Kartochkalari */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* {t('products.totalProducts')} */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-blue-600">Jami</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-700">{totalProducts}</p>
            <p className="text-xs text-blue-600 mt-1">Mahsulot turi</p>
          </CardContent>
        </Card>

        {/* Jami Qoplar */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 border-green-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📦</span>
              <span className="text-xs sm:text-sm font-medium text-green-600">Qoplar</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-700">{totalStock.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">Jami qop</p>
          </CardContent>
        </Card>

        {/* Jami Qiymat */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-2 border-emerald-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">�</span>
              <span className="text-xs sm:text-sm font-medium text-emerald-600">Qiymat</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-700">{(totalValue / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-emerald-600 mt-1">UZS</p>
          </CardContent>
        </Card>

        {/* Optimal Stock */}
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 border-2 border-cyan-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">✅</span>
              <span className="text-xs sm:text-sm font-medium text-cyan-600">Yaxshi</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-cyan-700">{optimalStockCount}</p>
            <p className="text-xs text-cyan-600 mt-1">Optimal</p>
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-2 border-orange-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">⚠️</span>
              <span className="text-xs sm:text-sm font-medium text-orange-600">Kam</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-orange-700">{lowStockCount}</p>
            <p className="text-xs text-orange-600 mt-1">
              {outOfStockCount > 0 && `(${outOfStockCount} tugagan)`}
            </p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <div className="max-h-[80vh] overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Yangi Mahsulot</span>
                <span className="text-sm text-muted-foreground">
                  Bosqich {step}/2
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm font-semibold mb-1">📝 Asosiy Ma'lumotlar</p>
                    <p className="text-xs text-muted-foreground">
                      Faqat mahsulot nomi, qop turi va narxini kiriting. Qolgan sozlamalarni keyinchalik o'zgartirish mumkin.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input 
                        label="Mahsulot Nomi *" 
                        placeholder="Mahsulot nomini kiriting"
                        value={form.name} 
                        onChange={(e) => setForm({ ...form, name: e.target.value })} 
                        required 
                      />
                    </div>
                    
                    <Input 
                      label="Qop Turi *" 
                      placeholder="Masalan: 50kg, 25kg, 10kg"
                      value={form.bagType} 
                      onChange={(e) => setForm({ ...form, bagType: e.target.value })} 
                      required 
                    />
                    
                    <Input 
                      label="Qop Narxi (UZS) *" 
                      type="number" 
                      step="0.01"
                      placeholder="Masalan: 50000"
                      value={form.pricePerBag} 
                      onChange={(e) => setForm({ ...form, pricePerBag: e.target.value })} 
                      required 
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowForm(false);
                        setStep(1);
                      }}
                      className="flex-1"
                    >
                      Bekor qilish
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleNext}
                      className="flex-1"
                    >
                      Keyingi →
                    </Button>
                  </div>
                </div>
              ) : (
                // BOSQICH 2: Qo'shimcha Sozlamalar
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="text-sm font-semibold mb-1">⚙️ Qo'shimcha Sozlamalar</p>
                    <p className="text-xs text-muted-foreground">
                      Bu sozlamalarni hozir yoki keyinchalik o'zgartirish mumkin. Standart qiymatlar o'rnatilgan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Ishlab Chiqarish Xarajati" 
                      type="number" 
                      step="0.01"
                      placeholder="0"
                      value={form.productionCost} 
                      onChange={(e) => setForm({ ...form, productionCost: e.target.value })} 
                    />
                    
                    <Input 
                      label="Minimal Zaxira (qop)" 
                      type="number"
                      placeholder="10"
                      value={form.minStockLimit} 
                      onChange={(e) => setForm({ ...form, minStockLimit: e.target.value })} 
                    />
                    
                    <Input 
                      label="Optimal Zaxira (qop)" 
                      type="number"
                      placeholder="50"
                      value={form.optimalStock} 
                      onChange={(e) => setForm({ ...form, optimalStock: e.target.value })} 
                    />
                    
                    <Input 
                      label="Maksimal Sig'im (qop)" 
                      type="number"
                      placeholder="200"
                      value={form.maxCapacity} 
                      onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })} 
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      ← Orqaga
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      ✓ Mahsulot Yaratish
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Mahsulotlar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => {
          const status = getStockStatus(product);
          const stockPercentage = ((product.currentStock / product.optimalStock) * 100).toFixed(0);
          const totalValue = product.currentStock * product.pricePerBag;
          
          return (
            <Card 
              key={product.id}
              className="cursor-pointer hover:shadow-xl transition-all active:scale-95 hover:border-primary"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-base sm:text-lg mb-1">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                        {product.bagType}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.unitsPerBag} dona/qop
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Package className="w-6 h-6 text-primary" />
                    <span className={`text-2xl ${status.color}`}>{status.emoji}</span>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className={`mb-3 px-3 py-2 rounded-lg ${status.bgColor} flex items-center justify-between`}>
                  <span className="font-bold text-sm">{status.emoji} {status.label}</span>
                  <span className="font-bold text-lg">{product.currentStock}</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Stock holati</span>
                    <span className="font-semibold">{stockPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        parseInt(stockPercentage) >= 80 ? 'bg-emerald-500' :
                        parseInt(stockPercentage) >= 50 ? 'bg-green-500' :
                        parseInt(stockPercentage) >= 30 ? 'bg-yellow-500' :
                        parseInt(stockPercentage) >= 15 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(parseInt(stockPercentage), 100)}%` }}
                    />
                  </div>
                </div>
                
                {/* Ma'lumotlar Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* Qoplar */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-400">📦 Qoplar</p>
                    <p className="font-bold text-blue-700 dark:text-blue-300">{product.currentStock}</p>
                  </div>
                  
                  {/* Minimal */}
                  <div className="bg-orange-50 dark:bg-orange-950 p-2 rounded-lg">
                    <p className="text-xs text-orange-600 dark:text-orange-400">⚠️ Minimal</p>
                    <p className="font-bold text-orange-700 dark:text-orange-300">{product.minStockLimit}</p>
                  </div>
                  
                  {/* Optimal */}
                  <div className="bg-green-50 dark:bg-green-950 p-2 rounded-lg col-span-2">
                    <p className="text-xs text-green-600 dark:text-green-400">✅ Optimal</p>
                    <p className="font-bold text-green-700 dark:text-green-300">{product.optimalStock}</p>
                  </div>
                </div>

                {/* Narx va Qiymat */}
                <div className="space-y-2 mb-3 p-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700 dark:text-emerald-300">💰 Narx/qop:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      {(product.pricePerBag / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700 dark:text-green-300">💎 Jami qiymat:</span>
                    <span className="font-bold text-green-700 dark:text-green-300">
                      {(totalValue / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>

                {/* Qo'shimcha ma'lumotlar */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 p-2 bg-muted rounded">
                  <span>🏭 Ishlab chiqarish:</span>
                  <span className="font-semibold">{(product.productionCost / 1000).toFixed(0)}K</span>
                </div>

                {/* Tugmalar */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 min-h-[44px] bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${product.id}`);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Batafsil
                  </Button>
                  <Button 
                    variant="destructive"
                    className="min-h-[44px] px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product.id, product.name);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Agar mahsulot bo'lmasa */}
      {products.length === 0 && !showForm && (
        <Card className="p-8 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Mahsulotlar yo'q</h3>
          <p className="text-muted-foreground mb-4">
            Hozircha hech qanday mahsulot qo'shilmagan
          </p>
          <Button onClick={() => setShowForm(true)}>
            Birinchi Mahsulotni Qo'shish
          </Button>
        </Card>
      )}
    </div>
  );
}
