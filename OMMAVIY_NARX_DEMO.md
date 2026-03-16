# Ommaviy Narx O'zgartirish - Demo va Qo'llanma

## ✅ Qo'shilgan Funksiyalar

### 1. UI Komponentlari

Narx belgilash modaliga quyidagi yangi bo'lim qo'shildi:

```
┌─────────────────────────────────────────────────────────┐
│ ⚡ Barcha mijozlar uchun narxni birdan o'zgartirish    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Miqdorni kiriting]  [% Foiz]  [UZS So'm]            │
│                                                         │
│  [📈 Ko'tarish]      [📉 Tushirish]                    │
│                                                         │
│  💡 Masalan: 10% yoki 5000 UZS ga barcha narxlarni    │
│     birdan o'zgartiring                                │
└─────────────────────────────────────────────────────────┘
```

### 2. State Management

```typescript
// Yangi state o'zgaruvchilari
const [bulkAmount, setBulkAmount] = useState<string>('');
const [bulkType, setBulkType] = useState<'percent' | 'fixed'>('percent');
```

### 3. Asosiy Funksiya

```typescript
const applyBulkAdjustment = (increase: boolean) => {
  const amount = parseFloat(bulkAmount);
  
  // Validatsiya
  if (!amount || amount <= 0) {
    alert('⚠️ Iltimos, to\'g\'ri miqdor kiriting!');
    return;
  }

  const updatedPrices: Record<string, string> = {};
  let appliedCount = 0;

  localCustomers.forEach((customer) => {
    // Hozirgi narxni olish
    const currentPriceStr = localPrices[customer.id] || 
                           product?.pricePerBag?.toString() || '0';
    const currentPrice = parseFloat(currentPriceStr);

    if (currentPrice > 0) {
      let newPrice: number;

      if (bulkType === 'percent') {
        // Foiz asosida
        const adjustment = (currentPrice * amount) / 100;
        newPrice = increase ? currentPrice + adjustment : currentPrice - adjustment;
      } else {
        // Qat'iy miqdor asosida
        newPrice = increase ? currentPrice + amount : currentPrice - amount;
      }

      // Xavfsizlik: manfiy narxlarni oldini olish
      newPrice = Math.max(0, Math.round(newPrice));
      updatedPrices[customer.id] = newPrice.toString();
      appliedCount++;
    }
  });

  setLocalPrices(updatedPrices);
  
  // Tasdiqlash xabari
  const action = increase ? 'ko\'tarildi' : 'tushirildi';
  const typeText = bulkType === 'percent' ? `${amount}%` : `${amount} UZS`;
  alert(`✅ ${appliedCount} ta mijoz uchun narx ${typeText} ga ${action}!`);
};
```

## 📋 Foydalanish Stsenariylari

### Stsenariy 1: Barcha Narxlarni 10% Ko'tarish

**Vaziyat:** Xom ashyo narxi oshdi, barcha mahsulot narxlarini 10% ga ko'tarish kerak.

**Qadamlar:**
1. Mahsulot sahifasini oching
2. "Narx belgilash" tugmasini bosing
3. Miqdor maydoniga `10` kiriting
4. "% Foiz" tugmasini tanlang
5. "Ko'tarish" tugmasini bosing
6. Tasdiqlash xabarini ko'ring
7. "Saqlash" tugmasini bosing

**Natija:**
```
Mijoz A: 100,000 → 110,000 UZS (+10,000)
Mijoz B: 150,000 → 165,000 UZS (+15,000)
Mijoz C: 200,000 → 220,000 UZS (+20,000)
```

### Stsenariy 2: Barcha Narxlarni 5,000 UZS Tushirish

**Vaziyat:** Aksiya davri, barcha mijozlarga 5,000 UZS chegirma berish kerak.

**Qadamlar:**
1. Mahsulot sahifasini oching
2. "Narx belgilash" tugmasini bosing
3. Miqdor maydoniga `5000` kiriting
4. "UZS So'm" tugmasini tanlang
5. "Tushirish" tugmasini bosing
6. Tasdiqlash xabarini ko'ring
7. "Saqlash" tugmasini bosing

**Natija:**
```
Mijoz A: 100,000 → 95,000 UZS (-5,000)
Mijoz B: 150,000 → 145,000 UZS (-5,000)
Mijoz C: 200,000 → 195,000 UZS (-5,000)
```

### Stsenariy 3: Sezonli Narx O'zgarishi

**Vaziyat:** Yoz mavsumi, narxlarni 15% ga ko'tarish.

**Qadamlar:**
1. Mahsulot sahifasini oching
2. "Narx belgilash" tugmasini bosing
3. Miqdor maydoniga `15` kiriting
4. "% Foiz" tugmasini tanlang
5. "Ko'tarish" tugmasini bosing
6. "Saqlash" tugmasini bosing

**Natija:**
```
Mijoz A: 100,000 → 115,000 UZS (+15,000)
Mijoz B: 150,000 → 172,500 UZS (+22,500)
Mijoz C: 200,000 → 230,000 UZS (+30,000)
```

## 🎯 Hisoblash Namunalari

### Foiz Asosida Ko'tarish

| Hozirgi Narx | 5%      | 10%     | 15%     | 20%     | 25%     |
|--------------|---------|---------|---------|---------|---------|
| 50,000       | 52,500  | 55,000  | 57,500  | 60,000  | 62,500  |
| 100,000      | 105,000 | 110,000 | 115,000 | 120,000 | 125,000 |
| 150,000      | 157,500 | 165,000 | 172,500 | 180,000 | 187,500 |
| 200,000      | 210,000 | 220,000 | 230,000 | 240,000 | 250,000 |

### Foiz Asosida Tushirish

| Hozirgi Narx | 5%     | 10%    | 15%    | 20%    | 25%    |
|--------------|--------|--------|--------|--------|--------|
| 50,000       | 47,500 | 45,000 | 42,500 | 40,000 | 37,500 |
| 100,000      | 95,000 | 90,000 | 85,000 | 80,000 | 75,000 |
| 150,000      | 142,500| 135,000| 127,500| 120,000| 112,500|
| 200,000      | 190,000| 180,000| 170,000| 160,000| 150,000|

### Qat'iy Miqdor Asosida

| Hozirgi Narx | +10,000 | +20,000 | -5,000  | -10,000 |
|--------------|---------|---------|---------|---------|
| 50,000       | 60,000  | 70,000  | 45,000  | 40,000  |
| 100,000      | 110,000 | 120,000 | 95,000  | 90,000  |
| 150,000      | 160,000 | 170,000 | 145,000 | 140,000 |
| 200,000      | 210,000 | 220,000 | 195,000 | 190,000 |

## 🛡️ Xavfsizlik Choralari

### 1. Manfiy Narxlardan Himoya

```typescript
// Agar natija manfiy bo'lsa, 0 ga o'rnatiladi
newPrice = Math.max(0, Math.round(newPrice));
```

**Misol:**
```
Hozirgi narx: 3,000 UZS
Tushirish: 5,000 UZS
Natija: 0 UZS (manfiy emas!) ✅
```

### 2. Yaxlitlash

```typescript
// Barcha narxlar butun sonlarga yaxlitlanadi
Math.round(newPrice)
```

**Misol:**
```
Hisoblangan: 105,750.5 UZS
Yaxlitlangan: 105,751 UZS ✅
```

### 3. Validatsiya

```typescript
// Bo'sh yoki noto'g'ri qiymatlar tekshiriladi
if (!amount || amount <= 0) {
  alert('⚠️ Iltimos, to\'g\'ri miqdor kiriting!');
  return;
}
```

## 📊 Interfeys Tafsilotlari

### Ranglar va Dizayn

```css
/* Ommaviy o'zgartirish bo'limi */
background: gradient(green-50 → emerald-50)
border: 2px green-200

/* Ko'tarish tugmasi */
background: gradient(blue-600 → blue-700)
icon: 📈

/* Tushirish tugmasi */
background: gradient(red-600 → red-700)
icon: 📉

/* Foiz/So'm tugmalari */
active: green-600 (oq matn)
inactive: gray-200 (kulrang matn)
```

### Responsive Dizayn

```css
/* Mobil (< 640px) */
flex-direction: column
gap: 3 (12px)

/* Desktop (≥ 640px) */
flex-direction: row
gap: 3 (12px)
```

## 🧪 Test Qilish

### Manual Test

1. **Server ishga tushiring:**
   ```bash
   npm run dev
   ```

2. **Brauzerda oching:**
   ```
   http://localhost:5173
   ```

3. **Login qiling:**
   - Email: admin@example.com
   - Parol: admin123

4. **Mahsulot sahifasiga o'ting**

5. **"Narx belgilash" tugmasini bosing**

6. **Ommaviy o'zgartirish funksiyasini sinab ko'ring:**
   - 10% ko'tarish
   - 5,000 UZS tushirish
   - Turli kombinatsiyalar

### Avtomatik Test

```bash
node test-bulk-price-adjustment.cjs
```

## 📝 Kod Joylashuvi

### Fayl: `src/pages/ProductDetail.tsx`

**State (qator ~763):**
```typescript
const [bulkAmount, setBulkAmount] = useState<string>('');
const [bulkType, setBulkType] = useState<'percent' | 'fixed'>('percent');
```

**Funksiya (qator ~810):**
```typescript
const applyBulkAdjustment = (increase: boolean) => {
  // ... implementatsiya
};
```

**UI (qator ~920):**
```tsx
<div className="bg-gradient-to-r from-green-50 to-emerald-50...">
  {/* Ommaviy o'zgartirish UI */}
</div>
```

## ✅ Tayyor!

Ommaviy narx o'zgartirish tizimi to'liq ishga tayyor. Barcha mijozlar uchun narxlarni bir vaqtning o'zida o'zgartirish endi juda oson va tez!

---

**Yaratilgan:** 2026-03-14
**Versiya:** 1.0.0
**Holat:** ✅ Ishlab chiqish tugallandi
