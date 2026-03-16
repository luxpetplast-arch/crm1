# Ommaviy Narx O'zgartirish - Kod O'zgarishlar

## 📁 O'zgartirilgan Fayl

**Fayl:** `src/pages/ProductDetail.tsx`  
**Qatorlar:** ~150 qo'shildi  
**Funksiyalar:** 1 yangi  
**State:** 2 yangi  

## 🔧 O'zgarishlar Ro'yxati

### 1. State O'zgaruvchilari Qo'shildi

**Joylashuv:** ~763-qator

```typescript
// OLDINGI KOD:
function PriceModalInner() {
  const [localCustomers, setLocalCustomers] = useState<any[]>([]);
  const [localPrices, setLocalPrices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

// YANGI KOD:
function PriceModalInner() {
  const [localCustomers, setLocalCustomers] = useState<any[]>([]);
  const [localPrices, setLocalPrices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [bulkAmount, setBulkAmount] = useState<string>('');
  const [bulkType, setBulkType] = useState<'percent' | 'fixed'>('percent');
```

**Qo'shilgan:**
- `bulkAmount` - Ommaviy o'zgartirish miqdori
- `bulkType` - O'zgartirish turi (foiz yoki qat'iy miqdor)

### 2. Yangi Funksiya Qo'shildi

**Joylashuv:** ~810-qator (loadModalData funksiyasidan keyin)

```typescript
const applyBulkAdjustment = (increase: boolean) => {
  const amount = parseFloat(bulkAmount);
  if (!amount || amount <= 0) {
    alert('⚠️ Iltimos, to\'g\'ri miqdor kiriting!');
    return;
  }

  const updatedPrices: Record<string, string> = {};
  let appliedCount = 0;

  localCustomers.forEach((customer) => {
    // Hozirgi narxni olish
    const currentPriceStr = localPrices[customer.id] || product?.pricePerBag?.toString() || '0';
    const currentPrice = parseFloat(currentPriceStr);

    if (currentPrice > 0) {
      let newPrice: number;

      if (bulkType === 'percent') {
        // Foiz asosida hisoblash
        const adjustment = (currentPrice * amount) / 100;
        newPrice = increase ? currentPrice + adjustment : currentPrice - adjustment;
      } else {
        // Qat'iy miqdor asosida
        newPrice = increase ? currentPrice + amount : currentPrice - amount;
      }

      // Manfiy narxlarni oldini olish
      newPrice = Math.max(0, Math.round(newPrice));
      updatedPrices[customer.id] = newPrice.toString();
      appliedCount++;
    }
  });

  setLocalPrices(updatedPrices);
  
  const action = increase ? 'ko\'tarildi' : 'tushirildi';
  const typeText = bulkType === 'percent' ? `${amount}%` : `${amount} UZS`;
  alert(`✅ ${appliedCount} ta mijoz uchun narx ${typeText} ga ${action}!`);
};
```

**Funksiya vazifasi:**
- Ommaviy narx o'zgartirishni amalga oshiradi
- Foiz yoki qat'iy miqdor asosida hisoblaydi
- Xavfsizlik tekshiruvlarini bajaradi
- Natijani foydalanuvchiga ko'rsatadi

### 3. UI Komponenti Qo'shildi

**Joylashuv:** ~920-qator (mahsulot ma'lumotidan keyin)

```typescript
// OLDINGI KOD:
return (
  <div className="space-y-4">
    <div className="bg-gradient-to-r from-blue-50 to-purple-50...">
      {/* Mahsulot ma'lumoti */}
    </div>

    <div className="bg-yellow-50...">
      {/* Mijozlar soni */}
    </div>

    <div className="max-h-96 overflow-y-auto...">
      {/* Mijozlar ro'yxati */}
    </div>
  </div>
);

// YANGI KOD:
return (
  <div className="space-y-4">
    <div className="bg-gradient-to-r from-blue-50 to-purple-50...">
      {/* Mahsulot ma'lumoti */}
    </div>

    {/* YANGI: Ommaviy narx o'zgartirish */}
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 rounded-lg border-2 border-green-200 dark:border-green-800">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <span className="text-lg">⚡</span>
        Barcha mijozlar uchun narxni birdan o'zgartirish
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="number"
            value={bulkAmount}
            onChange={(e) => setBulkAmount(e.target.value)}
            placeholder="Miqdorni kiriting"
            min="0"
            step="1"
            className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:bg-gray-800"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setBulkType('percent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              bulkType === 'percent'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            % Foiz
          </button>
          <button
            type="button"
            onClick={() => setBulkType('fixed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              bulkType === 'fixed'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            UZS So'm
          </button>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={() => applyBulkAdjustment(true)}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span className="text-lg">📈</span>
          Ko'tarish
        </button>
        <button
          type="button"
          onClick={() => applyBulkAdjustment(false)}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span className="text-lg">📉</span>
          Tushirish
        </button>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
        💡 Masalan: 10% yoki 5000 UZS ga barcha narxlarni birdan o'zgartiring
      </p>
    </div>

    <div className="bg-yellow-50...">
      {/* Mijozlar soni */}
    </div>

    <div className="max-h-96 overflow-y-auto...">
      {/* Mijozlar ro'yxati */}
    </div>
  </div>
);
```

**Qo'shilgan elementlar:**
- Miqdor kiritish input maydoni
- Tur tanlash tugmalari (% Foiz / UZS So'm)
- Yo'nalish tugmalari (Ko'tarish / Tushirish)
- Yordam matni

## 📊 Kod Statistikasi

```
Jami qo'shilgan qatorlar: ~150
Yangi funksiyalar: 1
Yangi state o'zgaruvchilari: 2
Yangi UI komponentlari: 1
O'zgartirilgan fayllar: 1
```

## 🎯 Asosiy Algoritmlar

### Foiz Asosida Hisoblash

```typescript
if (bulkType === 'percent') {
  const adjustment = (currentPrice * amount) / 100;
  newPrice = increase ? currentPrice + adjustment : currentPrice - adjustment;
}
```

**Misol:**
```
currentPrice = 100,000
amount = 10 (10%)
adjustment = 100,000 × 10 / 100 = 10,000
newPrice = 100,000 + 10,000 = 110,000
```

### Qat'iy Miqdor Asosida Hisoblash

```typescript
if (bulkType === 'fixed') {
  newPrice = increase ? currentPrice + amount : currentPrice - amount;
}
```

**Misol:**
```
currentPrice = 100,000
amount = 5,000
newPrice = 100,000 - 5,000 = 95,000
```

### Xavfsizlik Tekshiruvi

```typescript
// Manfiy narxlarni oldini olish
newPrice = Math.max(0, Math.round(newPrice));
```

**Misol:**
```
Hisoblangan: -2,000
Natija: max(0, -2,000) = 0 ✅
```

## 🔍 TypeScript Type Definitions

```typescript
// State turlari
const [bulkAmount, setBulkAmount] = useState<string>('');
const [bulkType, setBulkType] = useState<'percent' | 'fixed'>('percent');

// Funksiya parametri
const applyBulkAdjustment = (increase: boolean) => {
  // ...
};

// Narxlar obyekti
const updatedPrices: Record<string, string> = {};
```

## 🎨 CSS Klasslar

### Asosiy Konteyner
```css
bg-gradient-to-r from-green-50 to-emerald-50
dark:from-green-950 dark:to-emerald-950
p-4 rounded-lg
border-2 border-green-200 dark:border-green-800
```

### Input Maydoni
```css
w-full px-3 py-2
border-2 border-gray-300 dark:border-gray-600
rounded-lg text-sm font-semibold
focus:border-green-500 focus:ring-2 focus:ring-green-200
dark:bg-gray-800
```

### Tugmalar (Tanlangan)
```css
bg-green-600 text-white shadow-md
```

### Tugmalar (Tanlanmagan)
```css
bg-gray-200 dark:bg-gray-700
text-gray-700 dark:text-gray-300
hover:bg-gray-300 dark:hover:bg-gray-600
```

### Ko'tarish Tugmasi
```css
bg-gradient-to-r from-blue-600 to-blue-700
hover:from-blue-700 hover:to-blue-800
text-white rounded-lg text-sm font-bold
shadow-md hover:shadow-lg transition-all
```

### Tushirish Tugmasi
```css
bg-gradient-to-r from-red-600 to-red-700
hover:from-red-700 hover:to-red-800
text-white rounded-lg text-sm font-bold
shadow-md hover:shadow-lg transition-all
```

## 🧪 Test Kod

**Fayl:** `test-bulk-price-adjustment.cjs`

```javascript
// Login funksiyasi
async function login() {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email: 'admin@example.com',
    password: 'admin123'
  });
  return response.data.token;
}

// Test funksiyasi
async function testBulkPriceAdjustment() {
  // Mahsulotlarni olish
  const products = await api.get('/products');
  
  // Mijozlarni olish
  const customers = await api.get('/customers');
  
  // Foiz asosida hisoblash simulatsiyasi
  const increasePercent = 10;
  const newPrice = Math.round(currentPrice + (currentPrice * increasePercent / 100));
  
  // Qat'iy miqdor asosida hisoblash simulatsiyasi
  const decreaseAmount = 5000;
  const newPrice = Math.max(0, currentPrice - decreaseAmount);
}
```

## 📝 Kommentlar

Kod ichida qo'shilgan kommentlar:

```typescript
// Validatsiya
if (!amount || amount <= 0) { ... }

// Hozirgi narxni olish
const currentPriceStr = localPrices[customer.id] || ...

// Foiz asosida hisoblash
if (bulkType === 'percent') { ... }

// Qat'iy miqdor asosida
else { ... }

// Manfiy narxlarni oldini olish
newPrice = Math.max(0, Math.round(newPrice));

// Tasdiqlash xabari
alert(`✅ ${appliedCount} ta mijoz uchun...`);
```

## ✅ Xulosa

Barcha kod o'zgarishlar to'liq hujjatlashtirildi. Kod:

✅ TypeScript bilan yozilgan  
✅ Type-safe  
✅ Yaxshi kommentlangan  
✅ Responsive dizayn  
✅ Dark mode qo'llab-quvvatlaydi  
✅ Xavfsiz va ishonchli  

---

**Yaratilgan:** 2026-03-14  
**Versiya:** 1.0.0  
**Holat:** ✅ Tayyor
