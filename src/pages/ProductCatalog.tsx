import { useState, useEffect } from 'react';
import Button from '../components/Button';
import BagLabelPrinter from '../components/BagLabelPrinter';
import { 
  Plus, 
  Trash2, 
  Printer,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import api from '../lib/api';

interface ProductType {
  id: string;
  name: string;
  bagType: string;
  currentStock: number;
  pricePerBag: number;
  unitsPerBag: number;
  minStockLimit: number;
  optimalStock: number;
  maxCapacity: number;
  productionCost: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductCategory {
  name: string;
  totalStock: number;
  totalValue: number;
  products: ProductType[];
  isExpanded: boolean;
}

export default function ProductCatalog() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLabelPrinter, setShowLabelPrinter] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductColor, setNewProductColor] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductUnits, setNewProductUnits] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      const productsData = response.data;
      organizeProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeProducts = (products: ProductType[]) => {
    const categoryMap = new Map<string, ProductType[]>();
    
    products.forEach(product => {
      // bagType dan kategoriya nomini ajratib olish
      // Masalan: "15gr-Preform-QORA" -> "15gr-Preform"
      const parts = (product.bagType || '').split('-');
      let categoryName = '';
      
      if (parts.length >= 2) {
        categoryName = `${parts[0]}-${parts[1]}`;
      } else {
        categoryName = parts[0] || 'Noma\'lum';
      }
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, []);
      }
      categoryMap.get(categoryName)!.push(product);
    });

    const organizedCategories: ProductCategory[] = [];
    categoryMap.forEach((categoryProducts, categoryName) => {
      const totalStock = categoryProducts.reduce((sum, p) => sum + p.currentStock, 0);
      const totalValue = categoryProducts.reduce((sum, p) => sum + (p.currentStock * p.pricePerBag), 0);
      
      organizedCategories.push({
        name: categoryName,
        totalStock,
        totalValue,
        products: categoryProducts,
        isExpanded: false
      });
    });

    setCategories(organizedCategories.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const toggleCategory = (categoryName: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.name === categoryName 
          ? { ...cat, isExpanded: !cat.isExpanded }
          : cat
      )
    );
  };

  const addNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      // Yangi kategoriya asosiy mahsulot sifatida yaratiladi
      const newProduct = {
        name: newCategoryName,
        bagName: newCategoryName,
        unitsPerBag: parseInt(newProductUnits) || 100,
        pricePerBag: parseFloat(newProductPrice) || 0,
        minStockLimit: 10,
        optimalStock: 50,
        maxCapacity: 200,
        productionCost: 0
      };

      await api.post('/products', {
        ...newProduct,
        bagType: newProduct.bagName,
        unitsPerBag: newProduct.unitsPerBag,
        minStockLimit: parseInt(newProduct.minStockLimit.toString()),
        optimalStock: parseInt(newProduct.optimalStock.toString()),
        maxCapacity: parseInt(newProduct.maxCapacity.toString()),
        pricePerBag: newProduct.pricePerBag,
        productionCost: newProduct.productionCost,
      });

      // Modalni yopish va formani tozalash
      setShowAddModal(false);
      setNewCategoryName('');
      setNewProductUnits('');
      setNewProductPrice('');
      
      // Mahsulotlarni qayta yuklash
      loadProducts();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Kategoriya yaratishda xatolik yuz berdi!');
    }
  };

  const addProductVariant = async (categoryName: string) => {
    if (!newProductName.trim() || !newProductColor.trim()) return;
    
    try {
      const newProduct = {
        name: newProductName,
        bagName: `${categoryName}-${newProductColor.trim()}`,
        unitsPerBag: parseInt(newProductUnits) || 100,
        pricePerBag: parseFloat(newProductPrice) || 0,
        minStockLimit: 10,
        optimalStock: 50,
        maxCapacity: 200,
        productionCost: 0
      };

      await api.post('/products', {
        ...newProduct,
        bagType: newProduct.bagName,
        unitsPerBag: newProduct.unitsPerBag,
        minStockLimit: newProduct.minStockLimit,
        optimalStock: newProduct.optimalStock,
        maxCapacity: newProduct.maxCapacity,
        pricePerBag: newProduct.pricePerBag,
        productionCost: newProduct.productionCost,
      });

      // Formni tozalash
      setNewProductName('');
      setNewProductColor('');
      setNewProductPrice('');
      setNewProductUnits('');
      
      // Mahsulotlarni qayta yuklash
      loadProducts();
    } catch (error) {
      console.error('Error creating product variant:', error);
      alert('Mahsulot varianti yaratishda xatolik yuz berdi!');
    }
  };

  const getStockStatus = (product: ProductType) => {
    if (product.currentStock === 0) {
      return { 
        color: 'text-red-600', 
        bgColor: 'bg-red-100 border-2 border-red-300 dark:bg-red-900 dark:text-red-200',
        label: 'Tugagan',
        emoji: '❌'
      };
    } else if (product.currentStock < product.minStockLimit) {
      return { 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100 border-2 border-orange-300 dark:bg-orange-900 dark:text-orange-200',
        label: 'Kam',
        emoji: '⚠️'
      };
    } else if (product.currentStock >= product.optimalStock) {
      return { 
        color: 'text-green-600', 
        bgColor: 'bg-green-100 border-2 border-green-300 dark:bg-green-900 dark:text-green-200',
        label: 'Yaxshi',
        emoji: '✅'
      };
    }
    
    return { 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100 border-2 border-blue-300 dark:bg-blue-900 dark:text-blue-200',
      label: 'Normal',
      emoji: '📦'
    };
  };

  const handlePrintLabels = (product: ProductType) => {
    setSelectedProduct(product);
    setShowLabelPrinter(true);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Mahsulotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mahsulot Katalogi</h1>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yangi Kategoriya
        </Button>
      </div>

      {/* Yangi kategoriya qo'shish modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-600">Yangi Mahsulot Kategoriya</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                ❌
              </Button>
            </div>

            <div className="space-y-6">
              {/* Asosiy kategoriya ma'lumotlari */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-4 text-blue-700">📦 Asosiy Kategoriya</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategoriya nomi *</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Masalan: 15gr-Preform"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bir qopdagi dona soni</label>
                    <input
                      type="number"
                      value={newProductUnits}
                      onChange={(e) => setNewProductUnits(e.target.value)}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bir qop narxi (so'm)</label>
                  <input
                    type="number"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mahsulot variantlari */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-4 text-green-700">🎨 Mahsulot Variantlari (Ranglar)</h3>
                <div className="space-y-3">
                  {['QORA', 'OQ', 'QIZIL', 'KO\'K', 'YASHIL', 'SARIQ'].map(color => (
                    <div key={color} className="flex items-center gap-3">
                      <label className="block text-sm font-medium text-gray-700 w-24">Rang: {color}</label>
                      <input
                        type="text"
                        value={newProductColor === color ? newProductName : ''}
                        onChange={(e) => {
                          setNewProductColor(color);
                          setNewProductName(e.target.value);
                        }}
                        placeholder={`${newCategoryName || 'Kategoriya'}-${color}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tugmalar */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Bekor qilish
                </Button>
                <Button
                  onClick={addNewCategory}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Kategoriya yaratish
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barcode tugmasi - mahsulotlar bo'limi tepasida */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: '16px',
        padding: '12px 16px',
        backgroundColor: '#f0fdf4',
        borderRadius: '8px',
        border: '2px solid #86efac'
      }}>
        <button
          onClick={() => {
            if (categories.length > 0 && categories[0].products.length > 0) {
              handlePrintLabels(categories[0].products[0]);
            } else {
              alert('Avval mahsulot qo\'shing!');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <Printer className="w-5 h-5" />
          Barcode / Yorliq chiqarish
        </button>
      </div>

      {/* Kategoriyalar - card ko'rinishida */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%' }}>
        {categories.map((category) => (
          <div 
            key={category.name} 
            style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '12px', 
              backgroundColor: 'white',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            {/* Kategoriya sarlavhasi - card header */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
              onClick={() => toggleCategory(category.name)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  {category.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>
                    {category.name}
                  </div>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>
                    {category.products.length} тур, {category.totalStock} қоп
                  </div>
                </div>
              </div>
              {category.isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </div>

            {/* Kategoriya ichidagi mahsulotlar (turlar) */}
            {category.isExpanded && (
              <div style={{ padding: '12px', backgroundColor: '#f3f4f6' }}>
                {/* Turlar jadvali */}
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e5e7eb' }}>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #d1d5db' }}>Tur</th>
                      <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #d1d5db' }}>Zaxira</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #d1d5db' }}>Narx</th>
                      <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #d1d5db' }}>Amal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.products.map((product) => {
                      const status = getStockStatus(product);
                      return (
                        <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{status.emoji}</span>
                              <span style={{ fontWeight: 500 }}>{product.name}</span>
                              <span style={{ fontSize: '10px', color: '#6b7280' }}>({product.unitsPerBag} dona)</span>
                            </div>
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <span style={{ 
                              padding: '2px 8px', 
                              borderRadius: '4px', 
                              backgroundColor: status.label === 'Tugagan' ? '#fee2e2' : status.label === 'Kam' ? '#ffedd5' : '#dcfce7',
                              color: status.label === 'Tugagan' ? '#dc2626' : status.label === 'Kam' ? '#ea580c' : '#16a34a',
                              fontSize: '11px',
                              fontWeight: 600
                            }}>
                              {product.currentStock} qop
                            </span>
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600, color: '#1d4ed8' }}>
                            {(product.pricePerBag / 1000).toFixed(0)}K
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button 
                                onClick={() => handlePrintLabels(product)}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '10px'
                                }}
                                title="Yorliq chiqarish"
                                aria-label="Yorliq chiqarish"
                              >
                                <Printer className="w-3 h-3" />
                              </button>
                              <button 
                                title="O'chirish"
                                aria-label="O'chirish"
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '10px'
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Yangi variant qo'shish */}
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      placeholder="Variant nomi"
                      style={{ flex: 1, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                    />
                    <label htmlFor="variant-color" style={{ fontSize: '12px', color: '#374151' }}>Rang:</label>
                    <select
                      id="variant-color"
                      value={newProductColor}
                      onChange={(e) => setNewProductColor(e.target.value)}
                      style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                    >
                      <option value="">Rang</option>
                      <option value="QORA">QORA</option>
                      <option value="OQ">OQ</option>
                      <option value="QIZIL">QIZIL</option>
                      <option value="KO'K">KO'K</option>
                      <option value="YASHIL">YASHIL</option>
                      <option value="SARIQ">SARIQ</option>
                    </select>
                    <button
                      onClick={() => addProductVariant(category.name)}
                      disabled={!newProductName.trim() || !newProductColor.trim()}
                      aria-label="Variant qo'shish"
                      style={{
                        padding: '6px 12px',
                        backgroundColor: (!newProductName.trim() || !newProductColor.trim()) ? '#9ca3af' : '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: (!newProductName.trim() || !newProductColor.trim()) ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bag Label Printer Modal */}
      {showLabelPrinter && selectedProduct && (
        <BagLabelPrinter
          product={selectedProduct}
          productCode="12"
          typeCode="34"
          onClose={() => {
            setShowLabelPrinter(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
