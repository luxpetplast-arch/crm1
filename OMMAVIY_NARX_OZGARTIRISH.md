# Ommaviy Narx O'zgartirish Tizimi

## Umumiy Ma'lumot

Barcha mijozlar uchun mahsulot narxlarini bir vaqtning o'zida o'zgartirish imkoniyati qo'shildi. Bu funksiya narxlarni tezda ko'tarish yoki tushirish uchun juda qulay.

## Asosiy Xususiyatlar

### 1. Ikki Xil O'zgartirish Turi

#### Foiz Asosida (%)
- Hozirgi narxning foiziga qarab o'zgartiradi
- Har bir mijoz uchun nisbiy o'zgarish
- Masalan: 10% ko'tarish - 100,000 UZS → 110,000 UZS

#### Qat'iy Miqdor Asosida (UZS)
- Barcha narxlarga bir xil miqdor qo'shadi yoki ayiradi
- Masalan: 5,000 UZS tushirish - 100,000 UZS → 95,000 UZS

### 2. Ikki Yo'nalish

#### Ko'tarish (📈)
- Narxlarni oshirish
- Foiz yoki qat'iy miqdor qo'shadi

#### Tushirish (📉)
- Narxlarni kamaytirish
- Foiz yoki qat'iy miqdor ayiradi
- Manfiy narxlar avtomatik 0 ga o'rnatiladi

## Foydalanish Bo'yicha Qo'llanma

### Qadam 1: Mahsulot Sahifasini Oching
1. Mahsulotlar ro'yxatidan kerakli mahsulotni tanlang
2. Mahsulot tafsilotlari sahifasiga o'ting

### Qadam 2: Narx Belgilash Modalini Oching
1. "Narx belgilash" tugmasini bosing
2. Modal oynasi ochiladi

### Qadam 3: Ommaviy O'zgartirish Bo'limini Toping
Modal oynasining yuqori qismida yashil rangdagi "Ommaviy narx o'zgartirish" bo'limi joylashgan.

### Qadam 4: Miqdorni Kiriting
```
Miqdorni kiriting: [_______]
```
- Foiz uchun: 5, 10, 15, 20 va h.k.
- So'm uchun: 1000, 5000, 10000 va h.k.

### Qadam 5: Tur Tanlang
- **% Foiz** - nisbiy o'zgarish uchun
- **UZS So'm** - qat'iy miqdor uchun

### Qadam 6: Yo'nalishni Tanlang
- **Ko'tarish** - narxlarni oshirish
- **Tushirish** - narxlarni kamaytirish

### Qadam 7: Natijani Tasdiqlang
1. Barcha mijozlar uchun narxlar avtomatik o'zgaradi
2. Tasdiqlash xabari ko'rsatiladi
3. "Saqlash" tugmasini bosib bazaga yozing

## Misollar

### Misol 1: 10% Ko'tarish
```
Hozirgi narxlar:
- Mijoz A: 100,000 UZS
- Mijoz B: 150,000 UZS
- Mijoz C: 200,000 UZS

10% ko'tarilgandan keyin:
- Mijoz A: 110,000 UZS (+10,000)
- Mijoz B: 165,000 UZS (+15,000)
- Mijoz C: 220,000 UZS (+20,000)
```

### Misol 2: 5,000 UZS Tushirish
```
Hozirgi narxlar:
- Mijoz A: 100,000 UZS
- Mijoz B: 150,000 UZS
- Mijoz C: 200,000 UZS

5,000 UZS tushirilgandan keyin:
- Mijoz A: 95,000 UZS (-5,000)
- Mijoz B: 145,000 UZS (-5,000)
- Mijoz C: 195,000 UZS (-5,000)
```

### Misol 3: Xavfsizlik (Manfiy Narxlar)
```
Hozirgi narx: 3,000 UZS
Tushirish: 5,000 UZS

Natija: 0 UZS (manfiy bo'lmaydi) ✅
```

## Texnik Tafsilotlar

### Frontend Implementatsiya
**Fayl:** `src/pages/ProductDetail.tsx`

#### State Management
```typescript
const [bulkAmount, setBulkAmount] = useState<string>('');
const [bulkType, setBulkType] = useState<'percent' | 'fixed'>('percent');
```

#### Asosiy Funksiya
```typescript
const applyBulkAdjustment = (increase: boolean) => {
  const amount = parseFloat(bulkAmount);
  
  localCustomers.forEach((customer) => {
    const currentPrice = parseFloat(localPrices[customer.id] || product?.pricePerBag);
    
    let newPrice: number;
    if (bulkType === 'percent') {
      const adjustment = (currentPrice * amount) / 100;
      newPrice = increase ? currentPrice + adjustment : currentPrice - adjustment;
    } else {
      newPrice = increase ? currentPrice + amount : currentPrice - amount;
    }
    
    // Manfiy narxlarni oldini olish
    newPrice = Math.max(0, Math.round(newPrice));
    updatedPrices[customer.id] = newPrice.toString();
  });
  
  setLocalPrices(updatedPrices);
};
```

### Xavfsizlik Choralari

1. **Manfiy Narxlar**: `Math.max(0, newPrice)` orqali oldini olinadi
2. **Yaxlitlash**: `Math.round()` orqali butun sonlarga aylantiriladi
3. **Validatsiya**: Bo'sh yoki noto'g'ri qiymatlar tekshiriladi
4. **Tasdiqlash**: Foydalanuvchiga natija haqida xabar beriladi

## Afzalliklari

✅ Tezkor narx o'zgartirish
✅ Barcha mijozlar uchun bir vaqtda
✅ Ikki xil hisoblash usuli
✅ Xavfsiz va ishonchli
✅ Intuitiv interfeys
✅ Real-time ko'rinish

## Test Qilish

Test faylni ishga tushiring:
```bash
node test-bulk-price-adjustment.cjs
```

Test quyidagilarni tekshiradi:
- Foiz asosida hisoblash
- Qat'iy miqdor asosida hisoblash
- Manfiy narxlardan himoya
- Turli foiz namunalari

## Kelajakdagi Yaxshilashlar

🔮 Rejadagi funksiyalar:
- Tanlangan mijozlar uchun ommaviy o'zgartirish
- Narx o'zgarish tarixi
- Narx shablonlari
- Avtomatik narx moslashuvi
- Narx tahlili va tavsiyalar

## Muammolarni Hal Qilish

### Muammo: Narxlar o'zgarmayapti
**Yechim:** 
- Miqdor to'g'ri kiritilganligini tekshiring
- Tur to'g'ri tanlanganligini tasdiqlang
- "Saqlash" tugmasini bosishni unutmang

### Muammo: Manfiy narxlar paydo bo'ldi
**Yechim:** 
- Tizim avtomatik 0 ga o'rnatadi
- Bu xavfsizlik chorasi

### Muammo: Foiz noto'g'ri hisoblanmoqda
**Yechim:**
- Hozirgi narxlar to'g'ri yuklanganligini tekshiring
- Brauzer konsolini tekshiring

## Yordam

Qo'shimcha yordam kerak bo'lsa:
1. Test faylni ishga tushiring
2. Brauzer konsolini tekshiring
3. Server loglarini ko'ring
4. Dokumentatsiyani qayta o'qing

---

**Yaratilgan sana:** 2026-03-14
**Versiya:** 1.0.0
**Holat:** ✅ Tayyor
