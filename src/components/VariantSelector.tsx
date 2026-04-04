import React, { useState } from 'react';

interface ProductVariant {
  id: string;
  variantName: string;
  currentStock: number;
  pricePerBag: number;
  active: boolean;
}

interface VariantSelectorProps {
  productId: string;
  productName: string;
  variants: ProductVariant[];
  selectedVariantId?: string;
  onSelect: (variantId: string, variant: ProductVariant) => void;
  showStock?: boolean;
  showPrice?: boolean;
  disabled?: boolean;
}

export function VariantSelector({
  productName,
  variants,
  selectedVariantId,
  onSelect,
  showStock = true,
  showPrice = true,
  disabled = false
}: VariantSelectorProps) {
  const [selected, setSelected] = useState<string | undefined>(selectedVariantId);

  const handleSelect = (variantId: string) => {
    if (disabled) return;
    
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;
    
    if (!variant.active || variant.currentStock === 0) {
      return;
    }
    
    setSelected(variantId);
    onSelect(variantId, variant);
  };

  // Color mapping for variants
  const getVariantColor = (variantName: string, isSelected: boolean): string => {
    const name = variantName.toLowerCase();
    const baseColors: Record<string, string> = {
      oq: isSelected ? 'bg-gray-200 border-gray-400' : 'bg-gray-100 border-gray-300',
      white: isSelected ? 'bg-gray-200 border-gray-400' : 'bg-gray-100 border-gray-300',
      qora: isSelected ? 'bg-gray-900 border-black text-white' : 'bg-gray-800 border-gray-900 text-white',
      black: isSelected ? 'bg-gray-900 border-black text-white' : 'bg-gray-800 border-gray-900 text-white',
      sariq: isSelected ? 'bg-yellow-200 border-yellow-400' : 'bg-yellow-100 border-yellow-300',
      yellow: isSelected ? 'bg-yellow-200 border-yellow-400' : 'bg-yellow-100 border-yellow-300',
      gidro: isSelected ? 'bg-blue-200 border-blue-400' : 'bg-blue-100 border-blue-300',
      hydro: isSelected ? 'bg-blue-200 border-blue-400' : 'bg-blue-100 border-blue-300',
      "ko'k": isSelected ? 'bg-blue-200 border-blue-400' : 'bg-blue-100 border-blue-300',
      blue: isSelected ? 'bg-blue-200 border-blue-400' : 'bg-blue-100 border-blue-300',
      qizil: isSelected ? 'bg-red-200 border-red-400' : 'bg-red-100 border-red-300',
      red: isSelected ? 'bg-red-200 border-red-400' : 'bg-red-100 border-red-300',
      yashil: isSelected ? 'bg-green-200 border-green-400' : 'bg-green-100 border-green-300',
      green: isSelected ? 'bg-green-200 border-green-400' : 'bg-green-100 border-green-300',
    };

    for (const [key, color] of Object.entries(baseColors)) {
      if (name.includes(key)) return color;
    }

    return isSelected ? 'bg-gray-200 border-gray-400' : 'bg-gray-100 border-gray-300';
  };

  const activeVariants = variants.filter(v => v.active);

  if (activeVariants.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Hech qanday rang mavjud emas
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-700">Rang tanlang:</h4>
        <span className="text-sm text-gray-500">{productName}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {activeVariants.map((variant) => {
          const isSelected = selected === variant.id;
          const isOutOfStock = variant.currentStock === 0;
          const isDisabled = disabled || isOutOfStock;

          return (
            <button
              key={variant.id}
              onClick={() => handleSelect(variant.id)}
              disabled={isDisabled}
              className={`
                ${getVariantColor(variant.variantName, isSelected)}
                border-2 rounded-lg p-4 text-center
                transition-all duration-200
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
                ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              `}
            >
              {/* Variant name */}
              <div className="font-semibold mb-2">{variant.variantName}</div>

              {/* Stock */}
              {showStock && (
                <div className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-gray-700'}`}>
                  {isOutOfStock ? 'Tugagan' : `${variant.currentStock} qop`}
                </div>
              )}

              {/* Price */}
              {showPrice && (
                <div className="text-xs text-gray-600 mt-1">
                  {variant.pricePerBag.toLocaleString()} so'm
                </div>
              )}

              {/* Selected indicator */}
              {isSelected && (
                <div className="mt-2">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected variant info */}
      {selected && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          {(() => {
            const selectedVariant = variants.find(v => v.id === selected);
            if (!selectedVariant) return null;

            return (
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">Tanlangan:</span>
                  <span className="ml-2 font-semibold">{selectedVariant.variantName}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Narx:</div>
                  <div className="font-semibold">{selectedVariant.pricePerBag.toLocaleString()} so'm</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
