# 🏭 Ombor Tekshiruvi va Ishlab Chiqarish Rejalashtirish Tizimi

**Sana:** 2026-03-11  
**Status:** ✅ Tayyor va Ishlayapti

---

## 📋 Nima Qilindi?

Buyurtma kelganida avtomatik ombor holatini tekshirib, qaysi mahsulotdan nechta ishlab chiqarish kerakligini ko'rsatadigan tizim yaratildi.

### Asosiy Xususiyatlar:

✅ **Avtomatik Ombor Tekshiruvi**
- Buyurtma yaratilganda har bir mahsulot uchun ombor holati tekshiriladi
- Buyurtma miqdori va ombordagi miqdor solishtiriladi
- Yetishmovchilik hisoblanadi

✅ **Ishlab Chiqarish Rejasi**
- Qaysi mahsulotdan nechta ishlab chiqarish kerak aniq ko'rsatiladi
- Agar omborda yetarli bo'lsa, "✅ Yetarli" deb ko'rsatiladi
- Agar yetishmasa, "🏭 X qop ishlab chiqarish kerak" deb ko'rsatiladi

✅ **Saytda Ko'rinish**
- Buyurtmalar sahifasida mahsulotlar bo'yicha tahlil kartochkasi
- Har bir mahsulot uchun:
  - 📋 Buyurtma miqdori
  - 📦 Ombordagi miqdor
  - 🏭 Ishlab chiqarish kerak bo'lgan miqdor

✅ **Botda Xabarnoma**
- Buyurtma tasdiqlanganida mijozga ombor holati haqida xabar yuboriladi
- Qaysi mahsulotlar ishlab chiqarilishi kerak ko'rsatiladi

---

## 🔧 Texnik Tafsilotlar

### Backend (server/routes/orders.ts)

```typescript
// Buyurtma yaratish
router.post('/', async (req, res) => {
  // ... buyurtma ma'lumotlarini olish
  
  const inventoryCheck = [];
  
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId }
    });
    
    const inStock = product.currentStock;
    const needed = quantityBags;
    const shortage = Math.max(0, needed - inStock);
    
    inventoryCheck.push({
      productId: product.id,
      productName: product.name,
      ordered: needed,
      inStock: inStock,
      needProduction: shortage,
      status: shortage > 0 ? 'NEED_PRODUCTION' : 'IN_STOCK'
    });
  }
  
  // Buyurtmani yaratish
  const order = await prisma.order.create({
    data: {
      // ...
      notes: JSON.stringify({
        userNotes: notes || '',
        inventoryCheck: inventoryCheck
      })
    }
  });
  
  // Ombor tekshiruvi natijasini qaytarish
  res.json({
    order,
    inventoryCheck
  });
});
```

### Bot (server/bot/super-customer-bot.ts)

```typescript
async function handleConfirmOrder(chatId, customerId, queryId) {
  const cart = userCarts.get(chatId);
  
  // Ombor holatini tekshirish
  const inventoryCheck = [];
  for (const item of cart) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId }
    });
    
    const inStock = product.currentStock;
    const needed = item.quantityBags;
    const shortage = Math.max(0, needed - inStock);
    
    inventoryCheck.push({
      productId: product.id,
      productName: product.name,
      ordered: needed,
      inStock: inStock,
      needProduction: shortage,
      status: shortage > 0 ? 'NEED_PRODUCTION' : 'IN_STOCK'
    });
  }
  
  // Buyurtmani yaratish
  const order = await prisma.order.create({
    data: {
      // ...
      notes: JSON.stringify({
        userNotes: 'Telegram botdan buyurtma',
        inventoryCheck: inventoryCheck
      })
    }
  });
  
  // Mijozga xabar yuborish
  let message = `
🎉 BUYURTMA QABUL QILINDI!

📦 Mahsulotlar: ...

🏭 ISHLAB CHIQARISH KERAK:
`;
  
  const needProduction = inventoryCheck.filter(item => item.needProduction > 0);
  if (needProduction.length > 0) {
    needProduction.forEach(item => {
      message += `
📦 ${item.productName}
   📋 Buyurtma: ${item.ordered} qop
   📦 Omborda: ${item.inStock} qop
   🏭 Ishlab chiqarish: ${item.needProduction} qop
`;
    });
  } else {
    message += `✅ Barcha mahsulotlar omborda mavjud!`;
  }
  
  await superCustomerBot?.sendMessage(chatId, message);
}
```

### Frontend (src/pages/Orders.tsx)

```typescript
// Mahsulotlar bo'yicha statistika
const productStats: any = {};

orders.forEach(order => {
  if (order.status !== 'CANCELLED' && order.status !== 'SOLD') {
    order.items?.forEach((item: any) => {
      if (!productStats[item.productId]) {
        productStats[item.productId] = {
          productName: item.product?.name || 'Noma\'lum',
          totalOrdered: 0,
          inStock: 0,
          needProduction: 0
        };
      }
      productStats[item.productId].totalOrdered += item.quantityBags;
    });
  }
});

// Ombordagi mahsulotlar bilan solishtirish
products.forEach(product => {
  if (productStats[product.id]) {
    productStats[product.id].inStock = product.currentStock;
    productStats[product.id].needProduction = Math.max(
      0,
      productStats[product.id].totalOrdered - product.currentStock
    );
  }
});

// Ko'rinish
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
  {Object.values(productStats).map((stat: any, index) => (
    <div key={index} className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
      <h4 className="font-semibold text-sm mb-2">{stat.productName}</h4>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-blue-600">📋 Buyurtma:</span>
          <span className="font-bold">{stat.totalOrdered} qop</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-600">📦 Omborda:</span>
          <span className="font-bold">{stat.inStock} qop</span>
        </div>
        <div className="flex justify-between">
          <span className={stat.needProduction > 0 ? 'text-orange-600' : 'text-gray-600'}>
            🏭 Ishlab chiqarish:
          </span>
          <span className={`font-bold ${stat.needProduction > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {stat.needProduction > 0 ? `${stat.needProduction} qop` : '✅ Yetarli'}
          </span>
        </div>
      </div>
    </div>
  ))}
</div>
```

---

## 📊 Misol

### Buyurtma:
```
Mijoz: Aziz Rahimov
Mahsulotlar:
  - PET granula: 100 qop
  - HDPE granula: 50 qop
  - PP granula: 30 qop
```

### Ombor Holati:
```
PET granula: 80 qop
HDPE granula: 60 qop
PP granula: 20 qop
```

### Natija:
```
🏭 ISHLAB CHIQARISH KERAK:

📦 PET granula
   📋 Buyurtma: 100 qop
   📦 Omborda: 80 qop
   🏭 Ishlab chiqarish: 20 qop

📦 PP granula
   📋 Buyurtma: 30 qop
   📦 Omborda: 20 qop
   🏭 Ishlab chiqarish: 10 qop

✅ HDPE granula - Omborda yetarli (60 qop)
```

---

## 🎯 Foydalanish

### 1. Saytda Buyurtma Yaratish

```
1. Buyurtmalar sahifasiga o'ting
2. "Yangi Buyurtma" tugmasini bosing
3. Mijoz va mahsulotlarni tanlang
4. "AI Tahlil va Yaratish" tugmasini bosing
5. Buyurtma yaratiladi va ombor tekshiruvi ko'rsatiladi
```

**Natija:**
- Buyurtma yaratiladi
- Mahsulotlar bo'yicha tahlil kartochkasi ko'rsatiladi
- Qaysi mahsulotdan nechta ishlab chiqarish kerak ko'rinadi

### 2. Botda Buyurtma Berish

```
1. Botni oching: https://t.me/luxpetplastbot
2. 🛒 Smart Buyurtma tugmasini bosing
3. Mahsulotlarni tanlang
4. Buyurtmani tasdiqlang
```

**Natija:**
- Buyurtma qabul qilindi xabari
- Ombor holati haqida ma'lumot
- Qaysi mahsulotlar ishlab chiqarilishi kerak

---

## 📱 Saytda Ko'rinish

### Mahsulotlar bo'yicha Tahlil Kartochkasi

```
┌─────────────────────────────────────┐
│ 🧠 Mahsulotlar bo'yicha tahlil     │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────┐   │
│ │ PET granula                 │   │
│ │ 📋 Buyurtma: 100 qop        │   │
│ │ 📦 Omborda: 80 qop          │   │
│ │ 🏭 Ishlab chiqarish: 20 qop │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ HDPE granula                │   │
│ │ 📋 Buyurtma: 50 qop         │   │
│ │ 📦 Omborda: 60 qop          │   │
│ │ 🏭 Ishlab chiqarish: ✅ Yetarli│   │
│ └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 🤖 Botda Xabarnoma

```
🎉 BUYURTMA QABUL QILINDI!

📋 Buyurtma raqami: BOT-1710234567890
📅 Sana: 11.03.2026
👤 Mijoz: Aziz Rahimov

📦 Mahsulotlar:

1. PET granula
   📊 100 qop
   💰 5,000,000 so'm

2. HDPE granula
   📊 50 qop
   💰 2,250,000 so'm

💵 JAMI: 7,250,000 so'm

🏭 ISHLAB CHIQARISH KERAK:

📦 PET granula
   📋 Buyurtma: 100 qop
   📦 Omborda: 80 qop
   🏭 Ishlab chiqarish: 20 qop

✅ Buyurtmangiz qabul qilindi va ko'rib chiqilmoqda.
📞 Tez orada operatorimiz siz bilan bog'lanadi.
```

---

## 🔍 Monitoring

### Database Query

```sql
-- Buyurtmalar va ombor holati
SELECT 
  o.order_number,
  o.created_at,
  c.name as customer_name,
  o.notes
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.created_at >= CURRENT_DATE
ORDER BY o.created_at DESC;

-- Notes maydonida inventoryCheck ma'lumotlari JSON formatida saqlanadi
```

### Loglar

```bash
# Console'da
✅ Buyurtma yaratildi: ORD-1710234567890
📊 Ombor tekshiruvi:
   - PET granula: 100 buyurtma, 80 omborda, 20 ishlab chiqarish
   - HDPE granula: 50 buyurtma, 60 omborda, yetarli
```

---

## ✅ Xususiyatlar

### Avtomatik Hisoblash
- ✅ Buyurtma miqdori
- ✅ Ombordagi miqdor
- ✅ Yetishmovchilik
- ✅ Ishlab chiqarish kerak bo'lgan miqdor

### Real-time Yangilanish
- ✅ Buyurtma yaratilganda
- ✅ Ombor holati o'zgarganda
- ✅ Mahsulot qo'shilganda

### Ko'p Mahsulot
- ✅ Bir buyurtmada ko'p mahsulot
- ✅ Har bir mahsulot uchun alohida tahlil
- ✅ Jami statistika

---

## 🎉 Natija

Endi buyurtma kelganida:

✅ Avtomatik ombor holati tekshiriladi
✅ Qaysi mahsulotdan nechta ishlab chiqarish kerak aniq ko'rsatiladi
✅ Saytda mahsulotlar bo'yicha tahlil kartochkasi ko'rinadi
✅ Botda mijozga ombor holati haqida xabar yuboriladi
✅ Ishlab chiqarish bo'limi aniq rejaga ega bo'ladi

---

**Tayyorlagan:** Kiro AI  
**Sana:** 2026-03-11  
**Status:** ✅ To'liq Tayyor va Ishlayapti  
**Versiya:** 1.0.0
