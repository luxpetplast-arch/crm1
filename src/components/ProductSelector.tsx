import { Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  pricePerBag: number;
  currentStock?: number;
  optimalStock?: number;
  minStockLimit?: number;
  bagType?: string;
}

interface ProductSelectorProps {
  products: Product[];
  selectedId: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string, name: string, price: number) => void;
  customerPrice?: number;
  onPriceClick?: (productId: string) => void;
}

export default function ProductSelector({
  products,
  selectedId,
  searchValue,
  onSearchChange,
  onSelect,
  customerPrice,
  onPriceClick,
}: ProductSelectorProps) {
  console.log('🔍 ProductSelector rendering with products:', products.length);
  console.log('🔍 Products data:', products);
  
  const filteredProducts = products.filter(p => {
    if (!p.name) return false;
    if (!searchValue) return true;
    return p.name.toLowerCase().includes(searchValue.toLowerCase());
  });

  console.log('🔍 Filtered products:', filteredProducts.length);
  console.log('🔍 Search value:', searchValue);

  return (
    <div className="space-y-3">
      <label className="block text-base font-semibold mb-3 flex items-center gap-2 text-green-600">
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <Search className="w-4 h-4" />
        </div>
        2. Mahsulotni Tanlang
      </label>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Mahsulot nomini kiriting..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 text-base bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900 transition-all shadow-sm"
        />
      </div>

      <div className="p-2 text-xs text-gray-500">
        📦 {filteredProducts.length} ta mahsulot topildi
      </div>
      
      {filteredProducts.map((product) => {
        console.log('🔄 Rendering product:', product.id, product.name);
        
        return (
          <button
            key={product.id}
            type="button"
            onClick={() => {
              console.log('🖱️ BUTTON CLICKED!', product.id, product.name);
              console.log('🖱️ About to call onSelect with:', { id: product.id, name: product.name, price: customerPrice || product.pricePerBag });
              
              try {
                onSelect(product.id, product.name, customerPrice || product.pricePerBag);
                console.log('✅ onSelect called successfully');
              } catch (error) {
                console.error('❌ Error calling onSelect:', error);
              }
            }}
            className={`w-full text-left px-4 py-3 mb-2 border-2 rounded-lg transition-colors ${
              selectedId === product.id 
                ? 'bg-blue-500 text-white border-blue-600' 
                : 'bg-white hover:bg-yellow-100 border-gray-200'
            }`}
          >
            <div className="font-semibold text-base">{product.name}</div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm">
                💰 ${(customerPrice || product.pricePerBag)}/qop
              </span>
              <span className="text-sm">
                📦 ${product.currentStock || 0} qop
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
