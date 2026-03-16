# Mijoz Narxlari Muammosi - Yakuniy Hisobot

## Muammo Tavsifi
Mahsulot sahifasida mijozlar uchun narx belgilashda 500 Internal Server Error yuz bermoqda.

## Xatolik Tarixi

### 1. Dastlabki Xatolik
```
PUT /api/customers/:id - 500 Internal Server Error
Invalid `prisma.customer.update()` invocation
...ductPrices`. Available options are marked with ?.
```

### 2. Keyingi Xatolik
```
GET /api/customers - 500 Internal Server Error
```

## Asosiy Sabab
Prisma Client schema bilan backend kod o'rtasida muvofiqlik yo'q. `productPrices` maydoni schema'da mavjud, lekin Prisma Client uni tanib olmayapti.

## Yechim

### QADAMLAR:

1. **Server'ni to'xtatish**
   ```bash
   # Terminal'da Ctrl+C bosing
   ```

2. **Prisma Client'ni regenerate qilish**
   ```bash
   npx prisma generate
   ```

3. **Database'ni yangilash (agar kerak bo'lsa)**
   ```bash
   npx prisma db push
   ```

4. **Server'ni qayta ishga tushirish**
   ```bash
   npm run dev
   ```

5. **Test qilish**
   - Mahsulotlar sahifasiga o'ting
   - Biror mahsulotni oching
   - "Narx belgilash" tugmasini bosing
   - Mijozlar ro'yxati ko'rinishi kerak
   - Bitta mijoz uchun narx kiriting
   - "Saqlash" tugmasini bosing

## Backend O'zgarishlar

### `server/routes/customers.ts`

```typescript
// PUT /customers/:id - Mijozni yangilash
router.put('/:id', async (req, res) => {
  try {
    console.log('📝 Mijoz yangilanmoqda:', req.params.id);
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    // Agar faqat productPrices yangilanayotgan bo'lsa
    if (Object.keys(req.body).length === 1 && req.body.productPrices !== undefined) {
      console.log('💰 Faqat productPrices yangilanmoqda');
      
      // JSON validatsiyasini tekshirish
      try {
        const parsed = JSON.parse(req.body.productPrices);
        console.log('✅ JSON valid:', parsed);
      } catch (jsonError: any) {
        return res.status(400).json({ 
          error: 'Invalid JSON in productPrices',
          details: jsonError.message 
        });
      }
      
      // Oddiy Prisma update
      const customer = await prisma.customer.update({
        where: { id: req.params.id },
        data: {
          productPrices: req.body.productPrices
        }
      });
      
      console.log('✅ Mijoz yangilandi:', customer.id);
      return res.json(customer);
    }
    
    // Boshqa maydonlar uchun...
    const allowedFields = [
      'name', 'email', 'phone', 'address', 'telegramChatId', 'telegramUsername',
      'notificationsEnabled', 'debtReminderDays', 'category', 'balance', 'debt',
      'creditLimit', 'paymentTermDays', 'discountPercent', 'pricePerBag', 'productPrices',
      'lastPurchase', 'lastPayment'
    ];
    
    const updateData: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: updateData,
    });
    
    res.json(customer);
  } catch (error: any) {
    console.error('❌ Xatolik:', error.message);
    res.status(500).json({ 
      error: 'Failed to update customer',
      details: error.message
    });
  }
});
```

## Frontend O'zgarishlar

### `src/pages/ProductDetail.tsx`

Narx validatsiya va logging qo'shildi:

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

const pricesJson = JSON.stringify(newPrices);

// Saqlash
const response = await api.put(`/customers/${customer.id}`, {
  productPrices: pricesJson
});
```

## Muhim Eslatmalar

1. **Prisma Client Regenerate** - Har safar schema o'zgarganda yoki xatolik bo'lganda:
   ```bash
   npx prisma generate
   ```

2. **Server Restart** - Backend kodda o'zgarish bo'lganda server'ni qayta ishga tushirish kerak

3. **Database Schema** - `productPrices` maydoni:
   ```prisma
   model Customer {
     // ...
     productPrices   String?  // JSON: {productId: price, ...}
     // ...
   }
   ```

4. **JSON Format** - productPrices qiymati:
   ```json
   {
     "product-id-1": 50000,
     "product-id-2": 45000
   }
   ```

## Kutilayotgan Natija

Muvaffaqiyatli ishlashi kerak:
- ✅ Mijozlar ro'yxati yuklanadi
- ✅ Narx kiritish mumkin
- ✅ Narxlar saqlanadi
- ✅ Database'da to'g'ri saqlanadi

## Keyingi Qadamlar

Agar muammo davom etsa:

1. Server terminalida to'liq error log'ni ko'ring
2. Browser console'da to'liq error object'ni ko'ring
3. Database'ni tekshiring:
   ```bash
   npx prisma studio
   ```
4. Prisma Client versiyasini tekshiring:
   ```bash
   npm list @prisma/client
   ```

## Test Fayllar
- `test-customer-price-update.cjs` - Backend test
- `test-product-pricing.cjs` - Integration test
- `NARX_500_XATOLIK_YECHIMI.md` - Batafsil yechim
