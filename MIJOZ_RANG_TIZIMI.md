# 🎨 Mijoz Kategoriya Rang Tizimi

## 📊 Kategoriyalar va Ranglar

### 1. VIP - To'q Yashil 💎
- **Rang:** `bg-emerald-100 text-emerald-800 border-emerald-300`
- **Dark:** `dark:bg-emerald-900 dark:text-emerald-200`
- **Emoji:** 💎 ⭐ 👑
- **Tavsif:** Eng yaxshi mijozlar

### 2. NORMAL - Yashil ✅
- **Rang:** `bg-green-100 text-green-800 border-green-300`
- **Dark:** `dark:bg-green-900 dark:text-green-200`
- **Emoji:** ✅ 👍
- **Tavsif:** Yaxshi mijozlar

### 3. RISK - Sariq ⚠️
- **Rang:** `bg-yellow-100 text-yellow-800 border-yellow-300`
- **Dark:** `dark:bg-yellow-900 dark:text-yellow-200`
- **Emoji:** ⚠️ 🔔
- **Tavsif:** O'rtacha, ehtiyot bo'lish kerak

### 4. BAD - Qizil ❌
- **Rang:** `bg-red-100 text-red-800 border-red-300`
- **Dark:** `dark:bg-red-900 dark:text-red-200`
- **Emoji:** ❌ 🚫 ⛔
- **Tavsif:** Muammoli mijozlar

## 🎯 Qo'llash Joylari

1. **Customers sahifasi** - Jadvalda
2. **Sales sahifasi** - Mijoz tanlaganda
3. **Orders sahifasi** - Buyurtma yaratishda
4. **Dashboard** - Statistikada
5. **CustomerProfile** - Profil sahifasida

## 💻 Kod Namunasi

```typescript
// Rang olish funksiyasi
const getCategoryColor = (category: string) => {
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
      return 'bg-gray-100 text-gray-800 border-2 border-gray-300';
  }
};

// Emoji olish
const getCategoryEmoji = (category: string) => {
  switch(category) {
    case 'VIP': return '💎';
    case 'NORMAL': return '✅';
    case 'RISK': return '⚠️';
    case 'BAD': return '❌';
    default: return '👤';
  }