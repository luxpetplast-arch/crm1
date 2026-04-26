import { Plus } from 'lucide-react';
import type { Product } from '../../types';
import { getCurrencySymbol, getDisplayAmount } from '../../lib/saleUtils';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  currency: string;
  onSelect: () => void;
  onQuickAdd: (e: React.MouseEvent) => void;
  latinToCyrillic: (text: string) => string;
}

export const ProductCard = ({
  product,
  isSelected,
  currency,
  onSelect,
  onQuickAdd,
  latinToCyrillic,
}: ProductCardProps) => {
  return (
    <div
      onClick={onSelect}
      className={`group p-3 rounded-xl cursor-pointer transition-all duration-300 border-2 relative overflow-hidden ${
        isSelected
          ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-blue-400 shadow-xl shadow-blue-500/30 scale-[1.02]'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1'
      }`}
    >
      {/* Quick Add Button */}
      <div className="absolute top-1 right-1 z-10">
        <button
          type="button"
          onClick={onQuickAdd}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-white/30 text-white hover:bg-white/50'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="pr-10">
        <span
          className={`font-bold text-sm line-clamp-2 leading-snug ${
            isSelected ? 'text-white drop-shadow-sm' : 'text-gray-800'
          }`}
        >
          {product.name}
        </span>
        <div className="flex items-center gap-2 mt-2">
          {product.bagType && (
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md shadow-sm ${
                isSelected
                  ? 'bg-white/25 text-white backdrop-blur-sm'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}
            >
              {product.bagType}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/40">
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
            isSelected
              ? 'bg-white/20 text-white backdrop-blur-sm'
              : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {product.currentStock || 0} {latinToCyrillic('qop')}
        </div>
        <span
          className={`text-sm font-bold ${
            isSelected ? 'text-white drop-shadow-sm' : 'text-blue-600'
          }`}
        >
          {getCurrencySymbol(currency)}
          {getDisplayAmount(parseFloat(product.pricePerBag?.toString() || '0'), currency)}
        </span>
      </div>
    </div>
  );
};

export default ProductCard;
