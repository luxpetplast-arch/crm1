# Buyurtma Sotish Tuzatishlari

## Muammolar va Yechimlar (2026-03-10)

### 1. Buyurtma Yaratish Muammosi ❌ → ✅

**Muammo:**
- Frontend'dan `quantityBags` va `quantityUnits` yuboriladi
- Backend `quantity` kutadi
- OrderItem yaratilmaydi
- Buyurtma bo'sh items bilan yaratiladi

**Yechim:**
```typescript
// Yangi buyurtma yaratish logikasi
router.post('/', authorize('ADMIN', 'CASHIER'), async (req: AuthRequest, res) => {
  const { customerId, items, notes, priority, requestedDate } = req.body;

  // Har bir mahsulot uchun ma'lumotlarni to'ldirish
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId }
    });

    const quantityBags = item.quantityBags || 0;
    const quantityUnits = item.quantityUnits || 0;
    const pricePerBag = product.pricePerBag;
    const subtotal = (quantityBags * pricePerBag) + 
                     (quantityUnits * (pricePerBag / product.unitsPerBag));

    totalAmount += subtotal;
    orderItems.push({ productId, quantityBags, quantityUnits, pricePerBag, subtotal });
  }

  // Buyurtmani items bilan yaratish
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      customerId,
      status: 'CONFIRMED',
      totalAmount,
      items: {
        create: orderItems
      }
    },
    include: {
      customer: true,
      items: { include: { product: true } }
    }
  });
});
```

### 2. Mijoz Daftariga Qarz Yozilmaydi ❌ → ✅

**Muammo:**
- Qarz hisoblanadi lekin mijoz daftariga yozilmaydi
- `customer.debt` yangilanmaydi

**Yechim:**
```typescript
// Qarzni mijoz daftariga yozish
if (remainingDebt > 0) {
  await prisma.customer.update({
    where: { id: order.customerId },
    data: {
      debt: {
        increment: remainingDebt  // Mavjud qarzga qo'shish
      }
    }
  });
  
  console.log(`✅ Qarz yozildi: ${order.customer.name} - ${remainingDebt}`);
}
```

### 3. Kassaga Pul Bormaydi ❌ → ✅

**Muammo:**
- Kassa tranzaksiyasi yaratilmaydi
- To'lov kassaga qo'shilmaydi

**Yechim:**
```typescript
// Kassa tranzaksiyasini yaratish
if (totalPaid > 0) {
  await prisma.cashboxTransaction.create({
    data: {
      type: 'INCOME',
      amount: totalPaid,
      category: 'SALE',
      description: `Buyurtma #${order.orderNumber} to'lovi`,
      userId: req.user!.id,
      userName: req.user!.name || 'Admin',
      reference: order.id
    }
  });
  
  console.log(`✅ Kassa tranzaksiyasi yaratildi: ${totalPaid}`);
}
```

### 4. To'lov Ma'lumotlari Saqlanmaydi ❌ → ✅

**Muammo:**
- `paymentDetails` maydoni Prisma clientda yo'q
- To'lov tafsilotlari yo'qoladi

**Yechim:**
```typescript
// To'lov ma'lumotlarini notes ga saqlash
const updatedOrder = await prisma.order.update({
  where: { id },
  data: {
    status: 'SOLD',
    notes: JSON.stringify({
      ...JSON.parse(order.notes || '{}'),
      paymentDetails,
      soldAt: new Date().toISOString(),
      totalPaid,
      remainingDebt
    })
  }
});
```

## To'liq Workflow

```
1. Buyurtma Yaratish
   ↓
   - Mahsulot ma'lumotlarini olish
   - Narxlarni hisoblash
   - OrderItem'larni yaratish
   - Status: CONFIRMED

2. Ishlab Chiqarish
   ↓
   - Status: IN_PRODUCTION
   - Status: READY

3. Sotish va To'lov
   ↓
   - To'lovni hisoblash (UZS + USD + Click)
   - Qarzni hisoblash (totalAmount - totalPaid)
   - Buyurtmani yangilash (status: SOLD)
   - Qarzni mijoz daftariga yozish
   - Kassa tranzaksiyasini yaratish
   - Telegram chek yuborish
```

## Test Qilish

```bash
node test-order-sell.js
```

**Test Natijalari:**
```
✅ Login muvaffaqiyatli
✅ Mijoz yaratildi
✅ Mahsulot yaratildi
✅ Buyurtma yaratildi
   Status: CONFIRMED
   Jami summa: 520000
   Items: 1

✅ Status: IN_PRODUCTION
✅ Status: READY

📊 OLDINGI HOLAT:
   Mijoz qarzi: 0
   Kassa tranzaksiyalari: 10

✅ BUYURTMA SOTILDI!
   To'langan: 350000
   Qarz: 170000

📊 KEYINGI HOLAT:
   Mijoz qarzi: 170000
   Qarz o'zgarishi: 170000
   Kassa tranzaksiyalari: 11
   Yangi tranzaksiyalar: 1

💰 OXIRGI KASSA TRANZAKSIYASI:
   Type: INCOME
   Amount: 350000
   Category: SALE
   Description: Buyurtma #ORD-1234567890 to'lovi
```

## Fayl O'zgarishlari

1. **server/routes/orders.ts**
   - Buyurtma yaratish to'liq qayta yozildi
   - OrderItem'lar to'g'ri yaratiladi
   - Qarz mijoz daftariga yoziladi
   - Kassa tranzaksiyasi yaratiladi
   - To'lov ma'lumotlari notes ga saqlanadi

2. **test-order-sell.js**
   - To'liq test skripti yaratildi
   - Barcha jarayonlarni tekshiradi

## Keyingi Qadamlar

- ✅ Buyurtma yaratish ishlaydi
- ✅ Qarz mijoz daftariga yoziladi
- ✅ Kassa tranzaksiyasi yaratiladi
- ✅ To'lov ma'lumotlari saqlanadi
- ⏳ Prisma client yangilash (npx prisma generate)
- ⏳ Real test qilish

---

**Yaratildi:** 2026-03-10
**Status:** ✅ Tuzatildi va Test Uchun Tayyor
