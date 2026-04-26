// Utility functions for Sale operations
import type { Product, SaleItemForm } from '../types';

export const DEFAULT_EXCHANGE_RATE = 12500;
export const DEFAULT_UNITS_PER_BAG = 2000;

// Get currency symbol
export const getCurrencySymbol = (currency: string): string => {
  return currency === 'UZS' ? 'UZS ' : '$';
};

// Format amount for display
export const formatAmount = (amount: number, currency: string): string => {
  if (currency === 'UZS') {
    return Math.round(amount).toLocaleString();
  }
  return amount.toFixed(2);
};

// Get display amount
export const getDisplayAmount = (amount: number, currency: string): string => {
  if (currency === 'UZS') {
    return Math.round(amount).toString();
  }
  return amount.toFixed(2);
};

// Calculate subtotal
export const calculateSubtotal = (
  quantity: number,
  pricePerBag: number,
  saleType: 'bag' | 'piece',
  unitsPerBag: number
): number => {
  if (saleType === 'piece') {
    const totalPieces = quantity * unitsPerBag;
    const pricePerPiece = pricePerBag / unitsPerBag;
    return totalPieces * pricePerPiece;
  }
  return quantity * pricePerBag;
};

// Calculate total amount from items
export const calculateTotal = (items: SaleItemForm[]): number => {
  return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
};

// Calculate paid amount
export const calculatePaidAmount = (
  paidUZS: string,
  paidUSD: string,
  paidCLICK: string,
  exchangeRate: number,
  currency: string
): number => {
  const uzs = parseFloat(paidUZS) || 0;
  const usd = parseFloat(paidUSD) || 0;
  const click = parseFloat(paidCLICK) || 0;

  if (currency === 'UZS') {
    return uzs + (usd * exchangeRate) + click;
  }
  return uzs / exchangeRate + usd + (click / exchangeRate);
};

// Calculate debt
export const calculateDebt = (total: number, paid: number): number => {
  return Math.max(0, total - paid);
};

// Get default piece price based on product name
export const getDefaultPiecePrice = (productName: string): number | null => {
  const name = productName?.toLowerCase() || '';
  const gramMatch = name.match(/(\d+)\s*(gr|g|гр|г)/);
  const gramSize = gramMatch ? parseInt(gramMatch[1]) : null;

  // Special prices for specific gram sizes
  const prices: Record<number, number> = {
    75: 0.14325,
    80: 0.152,
    85: 0.172,
    86: 0.1745,
    135: 0.258,
  };

  if (gramSize && prices[gramSize]) {
    return prices[gramSize];
  }

  // 48 krishka
  if (name.includes('48') && (name.includes('krishka') || name.includes('qopqoq') || name.includes('cap'))) {
    return 0.012;
  }

  // 48 ruchka
  if (name.includes('48') && (name.includes('ruchka') || name.includes('handle'))) {
    return 0.016;
  }

  // 28 ruchka
  if (name.includes('28') && (name.includes('ruchka') || name.includes('handle'))) {
    return 0.007;
  }

  // 28 krishka
  if (name.includes('28') && (name.includes('krishka') || name.includes('qopqoq') || name.includes('cap'))) {
    if (name.includes('dkm')) {
      return 0.0012;
    }
    return 0.007;
  }

  // 38 krishka
  if (name.includes('38') && (name.includes('krishka') || name.includes('qopqoq') || name.includes('cap'))) {
    return 0.012;
  }

  return null;
};

// Get default units per bag
export const getDefaultUnitsPerBag = (productName: string): number | null => {
  const name = productName?.toLowerCase() || '';
  const gramMatch = name.match(/(\d+)\s*(gr|g|гр|г)/);
  const gramSize = gramMatch ? parseInt(gramMatch[1]) : null;

  // 75, 80, 85, 86gr - 4000 dona
  if ([75, 80, 85, 86].includes(gramSize || 0)) {
    return 4000;
  }

  // 135gr - 2500 dona
  if (gramSize === 135) {
    return 2500;
  }

  // Krishka - 2000 dona/qop
  if (name.includes('krishka') || name.includes('qopqoq') || name.includes('cap')) {
    return 2000;
  }

  // Ruchka - 1000 dona/qop
  if (name.includes('ruchka') || name.includes('handle')) {
    return 1000;
  }

  return null;
};

// Get piece price for komplekt mode
export const getPiecePrice = (productName: string): number | null => {
  const name = productName?.toLowerCase() || '';

  // 48 krishka
  if (name.includes('48') && (name.includes('krishka') || name.includes('qopqoq') || name.includes('cap'))) {
    return 0.012;
  }

  // 48 ruchka
  if (name.includes('48') && (name.includes('ruchka') || name.includes('handle'))) {
    return 0.016;
  }

  // 28 ruchka
  if (name.includes('28') && (name.includes('ruchka') || name.includes('handle'))) {
    return 0.007;
  }

  // 28 krishka
  if (name.includes('28') && (name.includes('krishka') || name.includes('qopqoq') || name.includes('cap'))) {
    if (name.includes('dkm')) {
      return 0.0012;
    }
    return 0.007;
  }

  // 38 krishka
  if (name.includes('38') && (name.includes('krishka') || name.includes('qopqoq') || name.includes('cap'))) {
    return 0.012;
  }

  return null;
};

// Determine target products for komplekt mode
export const getKomplektTargets = (preformName: string): { krishkaGram: number | null; ruchkaGram: number | null; needsRuchka: boolean } => {
  const gramMatch = preformName?.match(/(\d+)\s*(gr|g|гр|г)/i);
  const gramSize = gramMatch ? parseInt(gramMatch[1]) : null;

  // Rules:
  // 15, 21, 26, 30 → 28 krishka (only krishka)
  // 36 → 28 krishka + 28 ruchka
  // 52, 70 → 38 krishka + ruchka
  // 75, 80, 85, 86, 135 → 48 krishka + ruchka

  if ([15, 21, 26, 30].includes(gramSize || 0)) {
    return { krishkaGram: 28, ruchkaGram: null, needsRuchka: false };
  }

  if (gramSize === 36) {
    return { krishkaGram: 28, ruchkaGram: 28, needsRuchka: true };
  }

  if ([52, 70].includes(gramSize || 0)) {
    return { krishkaGram: 38, ruchkaGram: 38, needsRuchka: true };
  }

  if ([75, 80, 85, 86, 135].includes(gramSize || 0)) {
    return { krishkaGram: 48, ruchkaGram: 48, needsRuchka: true };
  }

  return { krishkaGram: null, ruchkaGram: null, needsRuchka: false };
};

// Filter products by category
export const filterProductsByCategory = (
  products: Product[],
  category: 'all' | 'preform' | 'krishka' | 'ruchka' | 'other'
): Product[] => {
  if (category === 'all') return products;

  return products.filter((p) => {
    const name = p.name?.toLowerCase() || '';
    const warehouse = p.warehouse?.toLowerCase() || '';

    switch (category) {
      case 'preform':
        return warehouse === 'preform' || name.includes('preform') || /\d+\s*(gr|g|гр|г)/.test(name);
      case 'krishka':
        return warehouse === 'krishka' || name.includes('krishka') || name.includes('qopqoq') || name.includes('cap') || name.includes('крышка');
      case 'ruchka':
        return warehouse === 'ruchka' || name.includes('ruchka') || name.includes('handle') || name.includes('ручка');
      case 'other':
        return !['preform', 'krishka', 'ruchka'].includes(warehouse) &&
               !name.includes('preform') && !/\d+\s*(gr|g|гр|г)/.test(name) &&
               !name.includes('krishka') && !name.includes('qopqoq') && !name.includes('cap') &&
               !name.includes('ruchka') && !name.includes('handle');
      default:
        return true;
    }
  });
};

// Group preforms by gram size
export const groupPreformsByGram = (products: Product[]) => {
  const allPreforms = products.filter((p) => {
    const name = p.name?.toLowerCase() || '';
    const warehouse = p.warehouse?.toLowerCase() || '';
    return warehouse === 'preform' || name.includes('preform') || /\d+\s*(gr|g|гр|г)/.test(name);
  });

  const gramSizes = [15, 21, 28, 32, 38, 43, 48];
  const groups: Record<string, Product[]> = {};

  gramSizes.forEach((gram) => {
    groups[`preform${gram}`] = allPreforms.filter((p) => {
      const name = p.name?.toLowerCase() || '';
      return name.includes(gram.toString()) || name.includes(`${gram}gr`) || name.includes(`${gram}g`);
    });
  });

  groups['preformBoshqa'] = allPreforms.filter((p) => {
    return !gramSizes.some((gram) => {
      const name = p.name?.toLowerCase() || '';
      return name.includes(gram.toString()) || name.includes(`${gram}gr`) || name.includes(`${gram}g`);
    });
  });

  return { allPreforms, groups };
};

// Validate sale form
export const validateSaleForm = (items: SaleItemForm[], customerId: string, manualCustomerName: string): string | null => {
  if (items.length === 0) {
    return 'Kamida bitta mahsulot qoshish kerak';
  }

  if (!customerId && !manualCustomerName) {
    return 'Mijoz tanlash yoki yangi mijoz qoshish kerak';
  }

  return null;
};
