import { useState, useEffect } from 'react';

interface VariantsData {
  productNameVariants: string[];
  bagTypeVariants: string[];
  unitsPerBagVariants: string[];
  priceVariants: string[];
  productionCostVariants: string[];
  stockVariants: string[];
  colorVariants: string[];
}

const defaultVariants: VariantsData = {
  productNameVariants: ["15gr Gidro", "21gr Prozraya", "26gr Siniy", "30gr Karbonat", "36gr Mix"],
  bagTypeVariants: ["15G", "21G", "28G", "5KG", "10KG", "25KG"],
  unitsPerBagVariants: ["1000", "2000", "5000", "10000"],
  priceVariants: ["25.00", "30.00", "45.00", "60.00", "75.00"],
  productionCostVariants: ["15.00", "20.00", "25.00", "35.00"],
  stockVariants: ["0", "100", "500", "1000", "2000"],
  colorVariants: ["QORA", "OQ", "QIZIL", "KO'K", "YASHIL", "SARIQ", "PUSHTI", "KULRANG"]
};

export function useVariants() {
  const [variants, setVariants] = useState<VariantsData>(defaultVariants);

  // localStorage dan variantlarni yuklash
  useEffect(() => {
    const savedVariants: Partial<VariantsData> = {};
    
    Object.keys(defaultVariants).forEach(key => {
      const saved = localStorage.getItem(`${key}`);
      if (saved) {
        try {
          savedVariants[key as keyof VariantsData] = JSON.parse(saved);
        } catch (error) {
          console.error(`Error loading ${key} variants:`, error);
        }
      }
    });

    if (Object.keys(savedVariants).length > 0) {
      setVariants(prev => ({ ...prev, ...savedVariants }));
    }
  }, []);

  // Yangi variant qo'shish
  const addVariant = (key: keyof VariantsData, newVariant: string) => {
    if (!newVariant.trim() || variants[key].includes(newVariant.trim())) {
      return false;
    }

    const updatedVariants = {
      ...variants,
      [key]: [...variants[key], newVariant.trim()]
    };

    setVariants(updatedVariants);
    localStorage.setItem(`${key}`, JSON.stringify(updatedVariants[key]));
    return true;
  };

  // Variantlarni olish
  const getVariants = (key: keyof VariantsData) => {
    return variants[key];
  };

  // Variantni o'chirish
  const deleteVariant = (key: keyof VariantsData, variantToDelete: string) => {
    const updatedList = variants[key].filter(v => v !== variantToDelete);
    
    const updatedVariants = {
      ...variants,
      [key]: updatedList
    };

    setVariants(updatedVariants);
    localStorage.setItem(`${key}`, JSON.stringify(updatedList));
    return true;
  };

  return {
    variants,
    addVariant,
    deleteVariant,
    getVariants
  };
}
