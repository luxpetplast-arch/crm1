// Ombor holati bo'yicha rang olish
export const getStockStatusColor = (currentStock: number, minStockLimit: number, optimalStock: number): string => {
  const percentage = (currentStock / optimalStock) * 100;
  void minStockLimit; // Future use
  
  if (percentage >= 80) {
    // Zo'r - To'q yashil (80%+)
    return 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200';
  } else if (percentage >= 50) {
    // Yaxshi - Yashil (50-79%)
    return 'bg-green-100 text-green-800 border-2 border-green-300 dark:bg-green-900 dark:text-green-200';
  } else if (percentage >= 30) {
    // O'rtacha - Sariq (30-49%)
    return 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200';
  } else if (percentage >= 15) {
    // Past - To'q sariq/Qizil-sariq (15-29%)
    return 'bg-orange-100 text-orange-800 border-2 border-orange-300 dark:bg-orange-900 dark:text-orange-200';
  } else {
    // Eng past - Qizil (0-14%)
    return 'bg-red-100 text-red-800 border-2 border-red-300 dark:bg-red-900 dark:text-red-200';
  }
};

// Ombor holati emoji
export const getStockStatusEmoji = (currentStock: number, minStockLimit: number, optimalStock: number): string => {
  const percentage = (currentStock / optimalStock) * 100;
  void minStockLimit; // Future use
  
  if (percentage >= 80) return '💎'; // Zo'r
  if (percentage >= 50) return '✅'; // Yaxshi
  if (percentage >= 30) return '⚠️'; // O'rtacha
  if (percentage >= 15) return '🔶'; // Past
  return '❌'; // Eng past
};

// Ombor holati matni
export const getStockStatusText = (currentStock: number, minStockLimit: number, optimalStock: number): string => {
  const percentage = (currentStock / optimalStock) * 100;
  void minStockLimit; // Future use
  
  if (percentage >= 80) return 'Zo\'r';
  if (percentage >= 50) return 'Yaxshi';
  if (percentage >= 30) return 'O\'rtacha';
  if (percentage >= 15) return 'Past';
  return 'Juda Past';
};

// Mijoz kategoriyasi bo'yicha rang
export const getCategoryColor = (category: string): string => {
  switch(category) {
    case 'VIP':
      return 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200';
    case 'NORMAL':
      return 'bg-green-100 text-green-800 border-2 border-green-300 dark:bg-green-900 dark:text-green-200';
    case 'RISK':
      return 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200';
    case 'BAD':
      return 'bg-red-100 text-red-800 border-2 border-red-300 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-2 border-gray-300 dark:bg-gray-900 dark:text-gray-200';
  }
};

// Mijoz kategoriyasi emoji
export const getCategoryEmoji = (category: string): string => {
  switch(category) {
    case 'VIP': return '💎';
    case 'NORMAL': return '✅';
    case 'RISK': return '⚠️';
    case 'BAD': return '❌';
    default: return '👤';
  }
};

// Mijoz kategoriyasi matni
export const getCategoryText = (category: string): string => {
  switch(category) {
    case 'VIP': return 'VIP Mijoz';
    case 'NORMAL': return 'Oddiy';
    case 'RISK': return 'Xavfli';
    case 'BAD': return 'Muammoli';
    default: return 'Noma\'lum';
  }
};
