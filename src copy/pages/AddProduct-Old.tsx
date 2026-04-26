import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import { Save, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import CategorySelector from '../components/CategorySelector';
import SizeSelector from '../components/SizeSelector';
import SubTypeSelector from '../components/SubTypeSelector';
import ProductTypeSelector from '../components/ProductTypeSelector';
import api from '../lib/api';
import { latinToCyrillic } from '../lib/transliterator';

export default function AddProduct() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    bagType: '',
    unitsPerBag: '',
    minStockLimit: '',
    optimalStock: '',
    maxCapacity: '',
    currentStock: '',
    pricePerBag: '',
    productionCost: '',
    isParent: false,
    active: true
  });

  // 3 darajali tanlov
  const [selectedCategory, setSelectedCategory] = useState({
    id: '',
    name: '',
    icon: '',
    color: ''
  });
  
  const [selectedSize, setSelectedSize] = useState({
    id: '',
    name: '',
    value: 0,
    unit: ''
  });
  
  const [selectedSubType, setSelectedSubType] = useState('');
  const [selectedProductType, setSelectedProductType] = useState<{
    id: string;
    name: string;
    defaultCard: string | undefined;
  }>({
    id: '',
    name: '',
    defaultCard: undefined
  });
  const [currentStep, setCurrentStep] = useState(1); // 1: category, 2: size, 3: subtype, 4: details

  // Step management
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle input changes for form fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    const finalValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  // Auto-generate product name based on selections
  useEffect(() => {
    if (selectedCategory.name && selectedSize.name && selectedSubType) {
      const generatedName = `${selectedSize.name} ${selectedCategory.name} ${selectedSubType}`;
      setFormData(prev => ({ ...prev, name: generatedName }));
    }
  }, [selectedCategory, selectedSize, selectedSubType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validatsiya
      if (!selectedCategory.id || !selectedSize.id || !selectedSubType || !formData.name || !formData.bagType || !formData.unitsPerBag || !formData.pricePerBag) {
        setMessage('❌ Iltimos, barcha majburiy maydonlarni to\'ldiring!');
        return;
      }

      // Mahsulot ma'lumotlarini tayyorlash
      const productData = {
        name: formData.name,
        bagType: formData.bagType,
        unitsPerBag: parseInt(formData.unitsPerBag),
        minStockLimit: parseInt(formData.minStockLimit) || 50,
        optimalStock: parseInt(formData.optimalStock) || 200,
        maxCapacity: parseInt(formData.maxCapacity) || 1000,
        currentStock: parseInt(formData.currentStock) || 0,
        pricePerBag: parseFloat(formData.pricePerBag),
        productionCost: parseFloat(formData.productionCost) || 0,
        isParent: formData.isParent,
        categoryId: selectedCategory.id,
        sizeId: selectedSize.id,
        subType: selectedSubType,
        active: formData.active
      };

      console.log('📤 Mahsulot yaratilmoqda:', productData);

      // Mahsulot yaratish
      const response = await api.post('/products', productData);
      
      setMessage(`✅ "${response.data.name}" mahsuloti muvaffaqiyatli yaratildi!`);

      // Formani tozalash
      setFormData({
        name: '',
        bagType: '',
        unitsPerBag: '',
        minStockLimit: '',
        optimalStock: '',
        maxCapacity: '',
        currentStock: '',
        pricePerBag: '',
        productionCost: '',
        isParent: false,
        active: true
      });
      setSelectedCategory({ id: '', name: '', icon: '', color: '' });
      setSelectedSize({ id: '', name: '', value: 0, unit: '' });
      setSelectedSubType('');
      setSelectedProductType({ id: '', name: '', defaultCard: undefined });
      setCurrentStep(1);

    } catch (error: any) {
      console.error('❌ Mahsulot yaratish xatoligi:', error);
      setMessage(`❌ Xatolik: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {latinToCyrillic("Orqaga")}
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {latinToCyrillic("Yangi Mahsulot Qo'shish")}
          </h1>
          <p className="text-gray-600">
            {latinToCyrillic("Yangi mahsulot qo'shish va uni avtomatik kartga joylash")}
          </p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-6">
            {message && (
              <div className={`mb-4 p-4 rounded-lg text-center font-medium ${
                message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mahsulot turi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  🏷️ {latinToCyrillic("Mahsulot turi")}
                </label>
                <ProductTypeSelector
                  selectedId={selectedProductType.id}
                  onSelect={(id: string, name: string, defaultCard?: string) => setSelectedProductType({ id, name, defaultCard })}
                  placeholder={latinToCyrillic("Mahsulot turini tanlang...")}
                />
                {selectedProductType.defaultCard && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    🃏 {latinToCyrillic("Avtomatik qo'shiladigan kart")}: {selectedProductType.defaultCard}
                  </div>
                )}
              </div>

              {/* Asosiy ma'lumotlar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📦 {latinToCyrillic("Mahsulot nomi")} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    placeholder={latinToCyrillic("Masalan: 15g Preform")}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏷️ {latinToCyrillic("Qop turi")} *
                  </label>
                  <input
                    type="text"
                    name="bagType"
                    value={formData.bagType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    placeholder={latinToCyrillic("Masalan: 15G, 5KG")}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🔢 {latinToCyrillic("Bir qopdagi dona soni")} *
                  </label>
                  <input
                    type="number"
                    name="unitsPerBag"
                    value={formData.unitsPerBag}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    placeholder="1000"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💰 {latinToCyrillic("Narx (USD)")} *
                  </label>
                  <input
                    type="number"
                    name="pricePerBag"
                    value={formData.pricePerBag}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    placeholder="25.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏭 {latinToCyrillic("Ishlab chiqarish narxi")}
                  </label>
                  <input
                    type="number"
                    name="productionCost"
                    value={formData.productionCost}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    placeholder="15.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📊 {latinToCyrillic("Joriy ombor")}
                  </label>
                  <input
                    type="number"
                    name="currentStock"
                    value={formData.currentStock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* Ombor limitlari */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ⚠️ {latinToCyrillic("Minimal chegara")}
                  </label>
                  <input
                    type="number"
                    name="minStockLimit"
                    value={formData.minStockLimit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    placeholder="50"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🎯 {latinToCyrillic("Optimal miqdor")}
                  </label>
                  <input
                    type="number"
                    name="optimalStock"
                    value={formData.optimalStock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    placeholder="200"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📈 {latinToCyrillic("Maksimal sig'im")}
                  </label>
                  <input
                    type="number"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    placeholder="1000"
                    min="0"
                  />
                </div>
              </div>

              {/* Qo'shimcha sozlamalar */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isParent"
                    checked={formData.isParent}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {latinToCyrillic("Ota mahsulot")}
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {latinToCyrillic("Faol")}
                  </span>
                </label>
              </div>

              {/* Submit tugmasi */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => window.history.back()}
                >
                  {latinToCyrillic("Bekor qilish")}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? latinToCyrillic("Yaratilmoqda...") : latinToCyrillic("Mahsulot yaratish")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
