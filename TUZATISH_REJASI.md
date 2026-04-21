# 🔧 KRITIK XATOLARNI TUZATISH REJASI

## Qaysi xatolarni tuzatish kerak?

### ✅ TUZATILGAN
1. JWT Secret - Doimiy secret ishlatilmoqda

### ⏳ TUZATISH KERAK (Zudlik bilan!)

#### 1. Race Condition + Transaction (sales.ts)
**Muammo:** Ombor tekshiruvi va kamaytirish atomik emas

**Yechim:**
```typescript
// Prisma Transaction ishlatish
await prisma.$transaction(async (tx) => {
  // 1. Mahsulotni lock bilan olish
  const product = await tx.product.findUnique({
    where: { id: productId }
  });
  
  // 2. Tekshirish
  if (product.currentStock < quantity) {
    throw new Error('Yetarli emas');
  }
  
  // 3. Kamaytirish (bir transactionda)
  await tx.product.update({
    where: { id: productId },
    data: { currentStock: { decrement: quantity } }
  });
  
  // 4. Sotuv yaratish
  await tx.sale.create({ ... });
});
```

#### 2. Ikki Marta Ombor Kamaytirish
**Muammo:** Variant va asosiy mahsulot ikkalasi ham kamayadi

**Yechim:**
```typescript
// Faqat variant ombori kamayadi (asosiy emas!)
if (item.variantId) {
  await tx.productVariant.update({
    where: { id: item.variantId },
    data: { 
      currentStock: { decrement: bagsToDeduct },
      currentUnits: { decrement: unitsToDeduct }
    }
  });
} else {
  // Faqat variant bo'lmasa asosiy mahsulot kamayadi
  await tx.product.update({
    where: { id: product.id },
    data: { 
      currentStock: { decrement: bagsToDeduct },
      currentUnits: { decrement: unitsToDeduct }
    }
  });
}
```

#### 3. Validatsiya Qo'shish
**Muammo:** Manfiy miqdor va narx qabul qilinadi

**Yechim:**
```typescript
// Miqdor validatsiyasi
if (!item.quantity || item.quantity <= 0 || isNaN(item.quantity)) {
  throw new Error('Miqdor musbat son bo\'lishi kerak');
}

// Narx validatsiyasi
const price = parseFloat(item.pricePerBag || item.pricePerPiece);
if (!price || price <= 0 || isNaN(price)) {
  throw new Error('Narx musbat son bo\'lishi kerak');
}

// Mahsulot ID validatsiyasi
if (!item.productId || typeof item.productId !== 'string') {
  throw new Error('Mahsulot ID noto\'g\'ri');
}
```

#### 4. Qarz Hisoblash Tuzatish
**Muammo:** USD va UZS aralashib ketadi

**Yechim:**
```typescript
// To'g'ri valyuta konvertatsiyasi
const debtAmount = totalAmount - paidAmount;

if (debtAmount > 0) {
  if (currency === 'UZS') {
    // So'mda qarz
    await tx.customer.update({
      where: { id: customerId },
      data: { debtUZS: { increment: debtAmount } }
    });
  } else if (currency === 'USD') {
    // Dollarda qarz
    await tx.customer.update({
      where: { id: customerId },
      data: { debtUSD: { increment: debtAmount } }
    });
  }
}
```

---

## Tuzatish Ketma-ketligi

1. **Birinchi:** Transaction qo'shish (eng muhim!)
2. **Ikkinchi:** Ikki marta ombor kamaytirish tuzatish
3. **Uchinchi:** Validatsiya qo'shish
4. **To'rtinchi:** Qarz hisoblash tuzatish

---

## Test Qilish

Har bir tuzatishdan keyin test qilish kerak:

```bash
# 1. Unit testlar
npm run test

# 2. E2E testlar
npm run test:e2e

# 3. Manual test
# - Bir vaqtda 2 ta mijoz buyurtma berish
# - Manfiy miqdor yuborish
# - Variant tanlash va ombor tekshirish
```

---

**Savol:** Qaysi xatoni birinchi tuzatishni xohlaysiz?

1. Race Condition + Transaction (eng muhim!)
2. Ikki marta ombor kamaytirish
3. Validatsiya qo'shish
4. Barchasi birdan

Javob bering, men tuzatishni boshlayman! 🚀
