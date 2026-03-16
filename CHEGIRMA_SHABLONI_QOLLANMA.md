# Chegirma Shabloni Tizimi - To'liq Qo'llanma

## 📋 Umumiy Ma'lumot

Chegirma shabloni tizimi mijozlar uchun barcha mahsulotlarga bir xil chegirma yoki qo'shimcha narx qo'llash imkonini beradi. Bu funksiya ikki joyda mavjud:

1. **Mahsulot sahifasida** - Bitta mahsulot uchun narx belgilanganda avtomatik chegirma shabloni yaratiladi
2. **Mijozlar sahifasida** - To'g'ridan-to'g'ri mijoz uchun chegirma shablonini qo'llash

## 🎯 Asosiy Xususiyatlar

### 1. Avtomatik Chegirma Shabloni (Mahsulot Sahifasida)

Agar bitta mahsulot uchun standart narxdan farqli narx belgilasangiz, tizim avtomatik chegirma shablonini yaratadi va uni boshqa mahsulotlarga ham qo'llash imkonini beradi.

**Misol:**
```
Mahsulot A standart narxi: 100,000 UZS
Mijoz uchun belgilangan narx: 95,000 UZS
Avtomatik chegirma shabloni: -5,000 UZS

Bu chegirmani boshqa mahsulotlarga ham qo'llash mumkin:
Mahsulot B: 150,000 → 145,000 UZS
Mahsulot C: 200,000 → 195,000 UZS
```

### 2. Manual Chegirma Shabloni (Mijozlar Sahifasida)

Mijozlar sahifasidan to'g'ridan-to'g'ri chegirma shablonini qo'llash mumkin.

**Misol:**
```
Mijoz: Test Mijoz
Chegirma: 5,000 UZS

Natija:
Barcha mahsulotlar standart narxdan 5,000 UZS arzonroq bo'ladi
```

## 📖 Foydalanish Bo'yicha Qo'llanma

### Usul 1: Mahsulot Sahifasidan

#### Qadam 1: Mahsulot Sahifasini Oching
```
Mahsulotlar → Mahsulotni tanlang → Tafsilotlar
```

#### Qadam 2: Narx Belgilash Modalini Oching
```
"Narx belgilash" tugmasini bosing
```

#### Qadam 3: Mijoz Uchun Narx Kiriting
```
Mijoz kartochkasida narx maydoniga chegirmali narx kiriting
Masalan: Standart 100,000 UZS → 95,000 UZS
```

#### Qadam 4: Chegirma Shablonini Ko'ring
```
Mijoz kartochkasida "Chegirma: -5000 UZS" ko'rinadi
Pastda "Chegirma shablonlari topildi" bo'limi paydo bo'ladi
```

#### Qadam 5: Barcha Mahsulotlarga Qo'llang
```
"Barcha mahsulotlarga qo'llash" tugmasini bosing
Tasdiqlang
```

### Usul 2: Mijozlar Sahifasidan

#### Qadam 1: Mijozlar Sahifasini Oching
```
Mijozlar → Mijozlar ro'yxati
```

#### Qadam 2: Mijozni Tanlang
```
Kerakli mijoz kartochkasida "Chegirma" tugmasini bosing
```

#### Qadam 3: Chegirma Miqdorini Kiriting
```
Chegirma miqdorini kiriting (masalan: 5000)
Musbat son = chegirma (standart narxdan ayiriladi)
Manfiy son = qo'shimcha (standart narxga qo'shiladi)
```

#### Qadam 4: Qo'llang
```
"Qo'llash" tugmasini bosing
Tasdiqlang
```

## 💡 Misollar

### Misol 1: Oddiy Chegirma

**Vaziyat:** VIP mijoz uchun barcha mahsulotlarga 10,000 UZS chegirma

**Qadamlar:**
1. Mijozlar sahifasidan mijozni tanlang
2. "Chegirma" tugmasini bosing
3. `10000` kiriting
4. "Qo'llash" tugmasini bosing

**Natija:**
```
Mahsulot A: 100,000 → 90,000 UZS
Mahsulot B: 150,000 → 140,000 UZS
Mahsulot C: 200,000 → 190,000 UZS
```

### Misol 2: Qo'shimcha Narx

**Vaziyat:** Uzoq masofadagi mijoz uchun yetkazib berish xarajati (+5,000 UZS)

**Qadamlar:**
1. Mijozlar sahifasidan mijozni tanlang
2. "Chegirma" tugmasini bosing
3. `-5000` kiriting (manfiy son = qo'shimcha)
4. "Qo'llash" tugmasini bosing

**Natija:**
```
Mahsulot A: 100,000 → 105,000 UZS
Mahsulot B: 150,000 → 155,000 UZS
Mahsulot C: 200,000 → 205,000 UZS
```

### Misol 3: Avtomatik Chegirma Shabloni

**Vaziyat:** Bitta mahsulot uchun chegirma berildi, boshqalariga ham qo'llash kerak

**Qadamlar:**
1. Mahsulot A sahifasini oching
2. "Narx belgilash" tugmasini bosing
3. Mijoz uchun 95,000 UZS kiriting (standart: 100,000)
4. Mijoz kartochkasida "Chegirma: -5000 UZS" ko'rinadi
5. Pastda "Barcha mahsulotlarga qo'llash" tugmasini bosing

**Natija:**
```
Mahsulot A: 95,000 UZS (qo'lda kiritilgan)
Mahsulot B: 145,000 UZS (avtomatik: 150,000 - 5,000)
Mahsulot C: 195,000 UZS (avtomatik: 200,000 - 5,000)
```

## 🔧 Texnik Tafsilotlar

### Backend API

**Endpoint:** `POST /api/customers/:id/apply-discount-template`

**Request Body:**
```json
{
  "discount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "appliedCount": 15,
  "customer": { ... }
}
```

### Frontend Implementatsiya

#### Mahsulot Sahifasida (ProductDetail.tsx)

**State:**
```typescript
const [customerDiscounts, setCustomerDiscounts] = useState<Record<string, number>>({});
```

**Funksiya:**
```typescript
const applyDiscountTemplates = async () => {
  for (const [customerId, discount] of Object.entries(customerDiscounts)) {
    await api.post(`/customers/${customerId}/apply-discount-template`, {
      discount
    });
  }
};
```

#### Mijozlar Sahifasida (Customers.tsx)

**State:**
```typescript
const [showDiscountModal, setShowDiscountModal] = useState(false);
const [discountAmount, setDiscountAmount] = useState<string>('');
```

**Funksiya:**
```typescript
const handleApplyDiscountTemplate = async (e: React.FormEvent) => {
  const discount = parseFloat(discountAmount);
  await api.post(`/customers/${selectedCustomer.id}/apply-discount-template`, {
    discount
  });
};
```

## 📊 Hisoblash Algoritmi

### Chegirma Qo'llash

```typescript
// Har bir mahsulot uchun
products.forEach(product => {
  const standardPrice = product.pricePerBag;
  const newPrice = Math.max(0, standardPrice - discount);
  productPrices[product.id] = newPrice;
});
```

**Misol:**
```
Standart narx: 100,000 UZS
Chegirma: 5,000 UZS
Yangi narx: max(0, 100,000 - 5,000) = 95,000 UZS
```

### Xavfsizlik

```typescript
// Manfiy narxlarni oldini olish
const newPrice = Math.max(0, standardPrice - discount);
```

**Misol:**
```
Standart narx: 3,000 UZS
Chegirma: 5,000 UZS
Yangi narx: max(0, 3,000 - 5,000) = 0 UZS ✅
```

## 🎨 Interfeys

### Mahsulot Sahifasida

```
┌─────────────────────────────────────────────────────┐
│ 🎁 Chegirma shablonlari topildi                    │
├─────────────────────────────────────────────────────┤
│ 2 ta mijoz uchun chegirma shabloni mavjud.        │
│ Ushbu chegirmalarni barcha boshqa mahsulotlarga   │
│ ham qo'llashingiz mumkin.                          │
│                                                     │
│ [✨ Barcha mahsulotlarga qo'llash]                 │
└─────────────────────────────────────────────────────┘
```

### Mijozlar Sahifasida

```
┌─────────────────────────────────────────────────────┐
│ Mijoz Kartochkasi                                   │
├─────────────────────────────────────────────────────┤
│ Test Mijoz                                          │
│ 📞 +998901234567                                    │
│                                                     │
│ [👁️ Batafsil]  [🎁 Chegirma]                       │
└─────────────────────────────────────────────────────┘
```

### Chegirma Modal

```
┌─────────────────────────────────────────────────────┐
│ Chegirma Shabloni - Test Mijoz                     │
├─────────────────────────────────────────────────────┤
│ 🎁 Chegirma Shabloni                               │
│ Ushbu mijoz uchun barcha mahsulotlarga bir xil    │
│ chegirma qo'llash                                   │
│                                                     │
│ Chegirma Miqdori (UZS)                             │
│ [5000                                    ]         │
│                                                     │
│ 💡 Musbat son: chegirma (masalan: 5000 = -5000)   │
│ 💡 Manfiy son: qo'shimcha (masalan: -5000 = +5000)│
│                                                     │
│ [Bekor qilish]  [✨ Qo'llash]                      │
└─────────────────────────────────────────────────────┘
```

## 🧪 Test Qilish

### Test Fayl

```bash
node test-discount-template.cjs
```

### Test Stsenariylari

1. **Oddiy chegirma:** 5,000 UZS chegirma qo'llash
2. **Qo'shimcha narx:** -5,000 UZS qo'shimcha qo'llash
3. **Xavfsizlik:** Manfiy narxlarni tekshirish
4. **Ko'p mahsulot:** Barcha mahsulotlarga qo'llash

## 📈 Afzalliklari

✅ Tezkor narx boshqaruvi  
✅ Barcha mahsulotlar uchun bir vaqtda  
✅ Ikki usul: avtomatik va manual  
✅ Xavfsiz va ishonchli  
✅ Intuitiv interfeys  
✅ Mijozlar sahifasidan ham mavjud  

## 🔮 Kelajakdagi Yaxshilashlar

- [ ] Chegirma shablonlari tarixi
- [ ] Vaqtinchalik chegirmalar (muddatli)
- [ ] Kategoriya bo'yicha chegirmalar
- [ ] Avtomatik chegirma qoidalari
- [ ] Chegirma shablonlari import/export

## 🆘 Muammolarni Hal Qilish

### Muammo: Chegirma qo'llanmayapti
**Yechim:** 
- Mijoz ID to'g'ri ekanligini tekshiring
- Server loglarini ko'ring
- Brauzer konsolini tekshiring

### Muammo: Manfiy narxlar paydo bo'ldi
**Yechim:** 
- Tizim avtomatik 0 ga o'rnatadi
- Bu xavfsizlik chorasi

### Muammo: Ba'zi mahsulotlarga qo'llanmadi
**Yechim:**
- Mahsulotning standart narxi mavjudligini tekshiring
- Server loglarida xatolarni qidiring

## 📞 Yordam

Qo'shimcha yordam kerak bo'lsa:
1. Test faylni ishga tushiring
2. Brauzer konsolini tekshiring
3. Server loglarini ko'ring
4. Dokumentatsiyani qayta o'qing

---

**Yaratilgan:** 2026-03-14  
**Versiya:** 1.0.0  
**Holat:** ✅ Tayyor va ishga tushirildi
