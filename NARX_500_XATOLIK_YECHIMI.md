# Mijoz Narxlarini Saqlashda 500 Xatolik - Yechim

## Muammo
Mahsulot sahifasida mijozlar uchun narx belgilashda "500 Internal Server Error" xatosi yuz bermoqda. Frontend'da narxlar to'g'ri kiritilmoqda, lekin backend'da saqlashda xatolik chiqmoqda.

## Amalga Oshirilgan Tuzatishlar

### 1. Backend - Batafsil Error Logging (`server/routes/customers.ts`)
```typescript
router.put('/:id', async (req, res) => {
  try {
    console.log('📝 Mijoz yangilanmoqda:', req.params.id);
    console.log('📦 Yangi ma\'lumotlar:', JSON.stringify(req.body, null, 2));
    
    // productPrices maydonini tekshirish
    if (req.body.productPrices) {
      console.log('💰 productPrices:', req.body.productPrices);
      console.log('💰 productPrices type:', typeof req.body.productPrices);
      
      // JSON validatsiyasini tekshirish
      try {
        const parsed = JSON.parse(req.body.productPrices);
        console.log('✅ JSON valid:', parsed);
      } catch (jsonError: any) {
        console.error('❌ JSON invalid:', jsonError.message);
        return res.status(400).json({ 
          error: 'Invalid JSON in productPrices',
          details: jsonError.message 
        });
      }
    }
    
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body,
    });
    
    console.log('✅ Mijoz yangilandi:', customer.id);
    res.json(customer);
  } catch (error: any) {
    console.error('❌ Mijozni yangilashda xatolik:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Prisma error code:', error.code);
    console.error('❌ Prisma error meta:', error.meta);
    res.status(500).json({ 
      error: 'Failed to update customer',
      details: error.message,
      code: error.code,
      meta: error.meta
    });
  }
});
```

### 2. Frontend - Narx Validatsiyasi va Logging (`src/pages/ProductDetail.tsx`)
```typescript
// Narxni raqamga aylantirish va tekshirish
const priceNumber = parseFloat(price.toString());
if (isNaN(priceNumber) || priceNumber < 0) {
  console.error(`❌ ${customer.name} uchun noto'g'ri narx:`, price);
  errorCount++;
  continue;
}

// Yangi narxni qo'shish
const newPrices = {
  ...existingPrices,
  [id as string]: priceNumber
};

console.log(`💰 ${customer.name} uchun narx saqlanmoqda:`, priceNumber);
console.log(`📊 Yangi narxlar obyekti:`, newPrices);

const pricesJson = JSON.stringify(newPrices);
console.log(`📝 JSON string:`, pricesJson);
console.log(`📏 JSON uzunligi:`, pricesJson.length);

// Saqlash
await api.put(`/customers/${customer.id}`, {
  productPrices: pricesJson
});
```

### 3. Frontend - Batafsil Error Handling
```typescript
} catch (customerError: any) {
  errorCount++;
  const errorDetails = customerError.response?.data;
  console.error(`❌ ${customer.name} uchun xatolik:`, errorDetails);
  console.error('Full error object:', {
    message: customerError.message,
    status: customerError.response?.status,
    data: errorDetails,
    code: errorDetails?.code,
    meta: errorDetails?.meta
  });
}
```

## Tekshirish Qadamlari

### 1. Server Loglarini Ko'rish
Server terminalida quyidagi loglarni qidiring:
```
📝 Mijoz yangilanmoqda: [customer-id]
📦 Yangi ma'lumotlar: {...}
💰 productPrices: {"product-id": 50000}
💰 productPrices type: string
✅ JSON valid: {...}
```

Agar xatolik bo'lsa:
```
❌ Mijozni yangilashda xatolik: [error message]
❌ Error stack: [stack trace]
❌ Prisma error code: [code]
❌ Prisma error meta: [meta]
```

### 2. Browser Console Loglarini Ko'rish
Browser console'da quyidagi loglarni qidiring:
```
💾 Narxlar saqlanmoqda...
📝 Kiritilgan narxlar: {...}
👥 Mijozlar soni: 23 ta
💰 [Customer Name] uchun narx saqlanmoqda: 50000
📊 Yangi narxlar obyekti: {...}
📝 JSON string: {"product-id": 50000}
📏 JSON uzunligi: 25
✅ [Customer Name] uchun narx saqlandi
```

### 3. Test Script Ishlatish
```bash
node test-customer-price-update.cjs
```

Bu script:
- Login qiladi
- Mijozlarni oladi
- Mahsulotlarni oladi
- Birinchi mijoz uchun narx belgilaydi
- Natijani tekshiradi

## Mumkin Bo'lgan Xatoliklar va Yechimlar

### 1. Prisma Schema Muammosi
**Alomat:** `Prisma error code: P2002` yoki `P2003`
**Yechim:** 
```bash
npx prisma generate
npx prisma db push
```

### 2. JSON Format Xatosi
**Alomat:** `Invalid JSON in productPrices`
**Yechim:** Frontend'da JSON.stringify to'g'ri ishlayotganini tekshiring

### 3. Database Constraint Xatosi
**Alomat:** `Unique constraint failed` yoki `Foreign key constraint failed`
**Yechim:** Database'ni tekshiring va constraint'larni ko'rib chiqing

### 4. Type Mismatch
**Alomat:** `Type 'string' is not assignable to type 'number'`
**Yechim:** parseFloat() to'g'ri ishlayotganini va NaN qaytarmayotganini tekshiring

## Database Schema
```prisma
model Customer {
  // ...
  productPrices   String?  // JSON: {productId: price, ...}
  // ...
}
```

`productPrices` maydoni:
- Type: `String?` (nullable string)
- Format: JSON string
- Example: `{"product-id-1": 50000, "product-id-2": 45000}`

## Keyingi Qadamlar

1. **Server'ni ishga tushiring:**
   ```bash
   npm run dev
   ```

2. **Browser'da test qiling:**
   - Mahsulotlar sahifasiga o'ting
   - Biror mahsulotni oching
   - "Narx belgilash" tugmasini bosing
   - Bitta mijoz uchun narx kiriting
   - "Saqlash" tugmasini bosing

3. **Loglarni kuzating:**
   - Server terminal: Backend loglar
   - Browser console: Frontend loglar

4. **Xatolik bo'lsa:**
   - Server terminaldan to'liq error stack'ni ko'ring
   - Browser console'dan to'liq error object'ni ko'ring
   - `error.code` va `error.meta` qiymatlarini tekshiring

## Kutilayotgan Natija

Muvaffaqiyatli saqlanganda:
```
Frontend:
✅ 1 ta mijoz uchun narxlar muvaffaqiyatli saqlandi!

Backend:
✅ Mijoz yangilandi: [customer-id]

Database:
productPrices: {"product-id": 50000}
```

## Qo'shimcha Ma'lumot

Agar muammo davom etsa, quyidagilarni tekshiring:
1. Prisma Client versiyasi
2. SQLite database fayl ruxsatlari
3. Node.js versiyasi
4. Network xatoliklari (CORS, timeout)

## Test Fayllar
- `test-customer-price-update.cjs` - Backend test
- `test-product-pricing.cjs` - To'liq integration test
