// Mijoz kategoriyasi bo'yicha rang olish
export const getCategoryColor = (category: string): string => {
  switch(category) {
    case 'VIP':
      return 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200 shadow-emerald-200';
    case 'PREMIUM':
      return 'bg-purple-100 text-purple-800 border-2 border-purple-300 dark:bg-purple-900 dark:text-purple-200 shadow-purple-200';
    case 'REGULAR':
      return 'bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-900 dark:text-blue-200 shadow-blue-200';
    case 'RISK':
      return 'bg-red-100 text-red-800 border-2 border-red-300 dark:bg-red-900 dark:text-red-200 shadow-red-200';
    case 'NEW':
      return 'bg-gray-100 text-gray-800 border-2 border-gray-300 dark:bg-gray-800 dark:text-gray-200 shadow-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-2 border-gray-300 dark:bg-gray-800 dark:text-gray-200';
  }
};

// Mijoz kategoriyasi bo'yicha emoji olish
export const getCategoryEmoji = (category: string): string => {
  switch(category) {
    case 'VIP':
      return '👑';
    case 'PREMIUM':
      return '⭐';
    case 'REGULAR':
      return '👤';
    case 'RISK':
      return '⚠️';
    case 'NEW':
      return '🆕';
    default:
      return '👤';
  }
};

// Mijoz kategoriyasi bo'yicha matn olish
export const getCategoryText = (category: string): string => {
  switch(category) {
    case 'VIP':
      return 'VIP Mijoz';
    case 'PREMIUM':
      return 'Premium';
    case 'REGULAR':
      return 'Oddiy';
    case 'RISK':
      return 'Xavfli';
    case 'NEW':
      return 'Yangi';
    default:
      return category;
  }
};
