import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Edit, 
  Trash2, 
  Eye,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import api from '../lib/professionalApi';
import { latinToCyrillic } from '../lib/transliterator';
import ModernLayout from '../components/ModernLayout';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  description?: string;
}

export default function ProductsModern() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Mock data for now
        const mockProducts: Product[] = [
          {
            id: '1',
            name: '15gr Preform 1.5kg',
            category: 'Preformalar',
            price: 12500,
            stock: 500,
            unit: 'dona'
          },
          {
            id: '2',
            name: 'Qop 5kg',
            category: 'Qoplamlar',
            price: 8500,
            stock: 1200,
            unit: 'dona'
          },
          {
            id: '3',
            name: 'Etiketka A4',
            category: 'Etiketkalar',
            price: 250,
            stock: 5000,
            unit: 'dona'
          },
          {
            id: '4',
            name: '18gr Preform 2kg',
            category: 'Preformalar',
            price: 15500,
            stock: 300,
            unit: 'dona'
          },
          {
            id: '5',
            name: 'Qop 10kg',
            category: 'Qoplamlar',
            price: 15000,
            stock: 800,
            unit: 'dona'
          }
        ];
        
        setProducts(mockProducts);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(mockProducts.map(p => p.category)));
        setCategories(['all', ...uniqueCategories]);
        
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  return (
    <ModernLayout 
      title={latinToCyrillic("Mahsulotlar")}
      subtitle={`${filteredProducts.length} ${latinToCyrillic("ta mahsulot")}`}
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={latinToCyrillic("Маҳсулотларни қидириш...")}
                className="input-modern w-full pl-12"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Filter className="w-5 h-5" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-modern pl-12 appearance-none cursor-pointer"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? latinToCyrillic("Барчаси") : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Add Product Button */}
          <button
            onClick={() => navigate('/add-product')}
            className="btn-gradient-primary px-6 py-3 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {latinToCyrillic("Янги Маҳсулот")}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="glass-card-light p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <p className="text-lg font-semibold text-primary mb-4">{latinToCyrillic("Хатолик Юз Берди")}</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="glass-card-light p-6 hover:scale-105 transition-transform duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <span className="badge-success text-xs">
                    {product.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-primary mb-2">{product.name}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary">{latinToCyrillic("Narx")}</span>
                    <span className="text-lg font-bold text-primary">{product.price.toLocaleString()} UZS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary">{latinToCyrillic("Ombor")}</span>
                    <span className={`font-medium ${product.stock < 100 ? 'text-red-500' : 'text-green-500'}`}>
                      {product.stock} {product.unit}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="btn-gradient-secondary flex-1 p-2 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{latinToCyrillic("Кўриш")}</span>
                  </button>
                  <button
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                    className="btn-gradient-primary flex-1 p-2 flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">{latinToCyrillic("Таҳрир")}</span>
                  </button>
                  <button
                    className="btn-gradient-danger p-2 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="glass-card-light p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                {latinToCyrillic("Маҳсулотлар топилмади")}
              </h3>
              <p className="text-secondary">
                {latinToCyrillic("Қидириш шартларини ўзгартириб қайта уриниб кўринг")}
              </p>
            </div>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
