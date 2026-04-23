import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import { 
  Plus, 
  Trash2, 
  Calculator,
  DollarSign,
  Printer,
  Edit
} from 'lucide-react';
import CustomerSelector from '../components/CustomerSelector';
import ProductSelector from '../components/ProductSelector';
import api from '../lib/api';
import { safeArray } from '../lib/safe-math';
import { latinToCyrillic } from '../lib/transliterator';
import { formatDateTime } from '../lib/dateUtils';
import { printReceipt, prepareSaleReceipt } from '../lib/receiptPrinter';

export default function SalesGrouped() {
  console.log('🏪 Sales Grouped component rendering...');
  
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({ USD_TO_UZS: 12500, EUR_TO_UZS: 13500 });
  const [activeTab, setActiveTab] = useState<'sales' | 'history'>('sales');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Qidiruv
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  
  // Form uchun
  const [form, setForm] = useState<{
    customerId: string;
    customerName: string;
    items: any[];
    paidUZS: string;
    paidUSD: string;
    paidCLICK: string;
    factoryShare: string;
    customerShare: string;
  }>({
    customerId: '',
    customerName: '',
    items: [],
    paidUZS: '',
    paidUSD: '',
    paidCLICK: '',
    factoryShare: '',
    customerShare: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mahsulot turlarini yuklash
      const typesResponse = await api.get('/product-types');
      setProductTypes(safeArray(typesResponse.data, []));
      
      // Mahsulotlarni yuklash
      const productsResponse = await api.get('/products');
      setProducts(safeArray(productsResponse.data, []));
      
      // Savdolarni yuklash
      const salesResponse = await api.get('/sales');
      setSales(safeArray(salesResponse.data, []));
      
      // Mijozlarni yuklash
      const customersResponse = await api.get('/customers');
      setCustomers(safeArray(customersResponse.data, []));
      
      console.log('📊 Yuklandi:', {
        types: safeArray(typesResponse.data, []).length,
        products: safeArray(productsResponse.data, []).length,
        sales: safeArray(salesResponse.data, []).length,
        customers: safeArray(customersResponse.data, []).length
      });
    } catch (error) {
      console.error('❌ Yuklashda xatolik:', error);
    }
  };

  // Mahsulot turi uchun icon va rang
  const getTypeIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('preform')) return '🔷';
    if (lower.includes('qop')) return '📦';
    if (lower.includes('qopqoq')) return '🔒';
    if (lower.includes('stiker')) return '🏷️';
    if (lower.includes('aksessuar')) return '🎁';
    return '📋';
  };

  const getTypeColor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('preform')) return 'bg-blue-50 border-blue-200 text-blue-800';
    if (lower.includes('qop')) return 'bg-green-50 border-green-200 text-green-800';
    if (lower.includes('qopqoq')) return 'bg-purple-50 border-purple-200 text-purple-800';
    if (lower.includes('stiker')) return 'bg-orange-50 border-orange-200 text-orange-800';
    if (lower.includes('aksessuar')) return 'bg-pink-50 border-pink-200 text-pink-800';
    return 'bg-gray-50 border-gray-200 text-gray-800';
  };

  // Savdolarni turlar bo'yicha guruhlash
  const groupSalesByProductType = () => {
    if (selectedType === 'all') {
      return productTypes.map(type => {
        const typeProducts = products.filter(p => p.productTypeId === type.id);
        const typeSales = sales.filter(sale => {
          return sale.items?.some((item: any) => 
            typeProducts.some(product => product.id === item.productId)
          );
        });
        
        return {
          type,
          products: typeProducts,
          sales: typeSales,
          totalAmount: typeSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
        };
      });
    } else {
      const type = productTypes.find(t => t.id === selectedType);
      if (!type) return [];
      
      const typeProducts = products.filter(p => p.productTypeId === type.id);
      const typeSales = sales.filter(sale => {
        return sale.items?.some((item: any) => 
          typeProducts.some(product => product.id === item.productId)
        );
      });
      
      return [{
        type,
        products: typeProducts,
        sales: typeSales,
        totalAmount: typeSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
      }];
    }
  };

  const groupedSales = groupSalesByProductType();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            💰 Savdolar
          </h1>
          <p className="text-muted-foreground mt-2">
            Turlar bo'yicha guruhlangan savdolar
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => window.location.href = '/sales'} 
            className="bg-gray-600 hover:bg-gray-700"
          >
            📋 Oddiy
          </Button>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yangi Sotuv
          </Button>
        </div>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📊</span>
              <span className="text-sm font-medium text-blue-600">Jami Savdolar</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{sales.length}</p>
            <p className="text-xs text-blue-600 mt-1">Barcha turlar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💵</span>
              <span className="text-sm font-medium text-green-600">Jami Summa</span>
            </div>
            <p className="text-2xl font-bold text-green-700">
              ${sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0).toFixed(2)}
            </p>
            <p className="text-xs text-green-600 mt-1">USD</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">👥</span>
              <span className="text-sm font-medium text-purple-600">Mijozlar</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">{customers.length}</p>
            <p className="text-xs text-purple-600 mt-1">Faol mijozlar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📦</span>
              <span className="text-sm font-medium text-orange-600">Mahsulotlar</span>
            </div>
            <p className="text-2xl font-bold text-orange-700">{products.length}</p>
            <p className="text-xs text-orange-600 mt-1">Turli turlar</p>
          </CardContent>
        </Card>
      </div>

      {/* Turlar filteri */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedType('all')}
        >
          📊 Barchasi ({sales.length})
        </Button>
        {productTypes.map(type => {
          const typeSalesCount = sales.filter(sale => {
            return sale.items?.some((item: any) => 
              products.some(product => product.id === item.productId && product.productTypeId === type.id)
            );
          }).length;
          
          return (
            <Button
              key={type.id}
              variant={selectedType === type.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type.id)}
            >
              {getTypeIcon(type.name)} {type.name} ({typeSalesCount})
            </Button>
          );
        })}
      </div>

      {/* Guruhlangan savdolar */}
      <div className="space-y-6">
        {groupedSales.map((group, index) => {
          if (group.sales.length === 0) {
            return (
              <div key={group.type.id} className="text-center py-8">
                <Card className="p-6">
                  <div className="text-gray-500">
                    <span className="text-2xl">{getTypeIcon(group.type.name)}</span>
                    <p className="mt-2">{group.type.name} turida savdolar yo'q</p>
                  </div>
                </Card>
              </div>
            );
          }

          return (
            <div key={group.type.id} className="space-y-4">
              {/* Tur sarlavhasi */}
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getTypeIcon(group.type.name)}</span>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">{group.type.name}</h2>
                        <p className="text-sm text-gray-600">
                          {group.type.description || 'Tavsif yo\'q'} • {group.sales.length} sotuv
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(group.type.name)}`}>
                        {group.type.defaultCard ? `🃏 ${group.type.defaultCard}` : '📋'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Savdolar soni</p>
                      <p className="text-2xl font-bold text-blue-600">{group.sales.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Jami summa</p>
                      <p className="text-2xl font-bold text-green-600">${group.totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">O'rtacha summa</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ${group.sales.length > 0 ? (group.totalAmount / group.sales.length).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Savdolar ro'yxati */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.sales.slice(0, 6).map((sale) => (
                  <Card key={sale.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">#{sale.id}</h3>
                          <p className="text-sm text-gray-600">{formatDateTime(sale.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">${sale.totalAmount?.toFixed(2) || '0.00'}</p>
                          <p className="text-xs text-gray-600">USD</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          👤 {sale.customerName || 'Noma\'lum'}
                        </span>
                        <span className="text-sm px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                          📦 {sale.items?.length || 0} mahsulot
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {group.sales.length > 6 && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => alert(`Barcha ${group.sales.length} ta savdolar ko'rsatiladi`)}>
                    Yana {group.sales.length - 6} ta savdoni ko'rish
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sales.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            <span className="text-4xl">💰</span>
            <h3 className="text-xl font-semibold mt-4 mb-2">Savdolar yo'q</h3>
            <p className="mb-4">Birinchi sotuvni qo'shish uchun "Yangi Sotuv" tugmasini bosing</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Yangi Sotuv
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
