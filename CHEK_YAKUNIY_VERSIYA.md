# ✅ CHEK YAKUNIY VERSIYA - TO'LIQ TAYYOR

**Sana:** 18 Mart 2026  
**Maqsad:** Professional, ixcham va to'liq ma'lumotli chek tizimi

---

## 🎯 Amalga Oshirilgan Barcha O'zgarishlar

### 1. **Dizayn Optimizatsiyasi**
- ✅ 80mm qog'ozga mos
- ✅ Bitta varoqqa sig'adigan
- ✅ Ixcham shriftlar (9-10px)
- ✅ Minimal bo'shliqlar
- ✅ Logo to'rtburchaksiz (oddiy matn)

### 2. **Mahsulotlar Jadvali**
Jadval 5 ustunli, to'rtburchak shakl ichida:

| Mahsulot | Soni | Qopdagi | Narxi | Jami narxi |
|----------|------|---------|-------|------------|
| Plastik qop 5kg | 5 qop | 100 dona | 10000 | 50000 |
| Butilka 1.5L | 10 dona | - | 12000 | 120000 |

- Mahsulot nomi (28%)
- Soni va o'lchov (18%)
- Qopdagi dona soni (18%)
- Dona/qop narxi (18%)
- Jami narx (18%)

### 3. **Mijoz Balansi**
**Tepada:**
```
Chek: CHK-12345
Sana: 18/03/2026 14:30
Mijoz: Aziz Rahimov
Oldingi balans: -150000 (qizil)
```

**Pastda:**
```
┌─────────────────────────┐
│ Yangi balans: -390000   │ (qizil/yashil)
└─────────────────────────┘
```

### 4. **Haydovchi Ma'lumotlari**
```
╔═══════════════════════════╗
║   YETKAZIB BERISH         ║
╠═══════════════════════════╣
║ Haydovchi: Sardor Aliyev  ║
║ Tel: +998 90 555 66 77    ║
╟───────────────────────────╢
║ Zavod to'laydi: 15000     ║
║ Mijoz to'laydi: 10000     ║
╚═══════════════════════════╝
```

### 5. **Qarz Muddatlari** (Keyingi bosqich)
Pastda qo'shilishi kerak:
```
╔═══════════════════════════╗
║   QARZ MA'LUMOTLARI       ║
╠═══════════════════════════╣
║ Eski qarz: -150000        ║
║ Qarz muddati: 45 kun      ║
║ To'lash sanasi: 02/05/26  ║
╟───────────────────────────╢
║ Yangi qarz: -240000       ║
║ To'lash sanasi: 17/04/26  ║
║ (30 kun ichida)           ║
╚═══════════════════════════╝
```

---

## 📋 To'liq Chek Tuzilishi

```
┌─────────────────────────────────┐
│      LUX PET PLAST             │
│    TOSHKENT DO'KONI            │
├─────────────────────────────────┤
│   AZIZ TRADES                  │
│   Toshkent sh., Chilonzor      │
│   Tel: +998 90 123 45 67       │
│   INN: 123456789               │
├─────────────────────────────────┤
│ Chek: CHK-12345                │
│ Sana: 18/03/2026 14:30         │
│ Mijoz: Aziz Rahimov            │
│ Oldingi balans: -150000        │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Mahsulot │ Soni │ Qopdagi  │ │
│ │          │      │ Narxi    │ │
│ │          │      │ Jami     │ │
│ ├─────────────────────────────┤ │
│ │ Plastik  │ 5    │ 100      │ │
│ │ qop 5kg  │ qop  │ 10000    │ │
│ │          │      │ 50000    │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Jami: 240000                   │
│ TO'LOV: 240000                 │
├─────────────────────────────────┤
│ Naqd (UZS): 240000             │
│ To'landi: 240000               │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │   YETKAZIB BERISH           │ │
│ ├─────────────────────────────┤ │
│ │ Haydovchi: Sardor Aliyev    │ │
│ │ Tel: +998 90 555 66 77      │ │
│ ├─────────────────────────────┤ │
│ │ Zavod to'laydi: 15000       │ │
│ │ Mijoz to'laydi: 10000       │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Yangi balans: -390000       │ │
│ └─────────────────────────────┘ │
│         RAHMAT!                │
│  Xaridingiz uchun tashakkur!   │
│  ID: sale-123456               │
└─────────────────────────────────┘
```

---

## 🔧 Kod O'zgarishlari

### Interface (ReceiptData)
```typescript
export interface ReceiptData {
  saleId: string;
  receiptNumber: string;
  date: string;
  time: string;
  cashier: string;
  customer: {
    name: string;
    phone?: string;
    address?: string;
    previousBalance?: number;  // Yangi
    newBalance?: number;        // Yangi
  };
  driver?: {                    // Yangi
    name: string;
    phone?: string;
    factoryShare: number;
    customerShare: number;
  };
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    piecesPerBag?: number;      // Yangi
    pricePerUnit: number;
    subtotal: number;
  }>;
  // ... qolgan maydonlar
}
```

### prepareSaleReceipt Funksiyasi
```typescript
export function prepareSaleReceipt(
  sale: any,
  customer: any,
  user: any,
  driver?: any,              // Yangi parametr
  exchangeRate: number = 12500
): ReceiptData
```

---

## 📊 Foydalanish

### Sales.tsx da:
```typescript
import { printReceipt, prepareSaleReceipt } from '@/lib/receiptPrinter';

// Chek chiqarish
const receiptData = prepareSaleReceipt(
  sale,
  customer,
  user,
  driver,        // Haydovchi ma'lumotlari
  exchangeRate
);

printReceipt(receiptData);
```

---

## ✨ Xususiyatlar

1. **80mm qog'ozga mos** - standart chek printeri
2. **Bitta varoqqa sig'adi** - 3-4 varoq emas
3. **To'liq ma'lumotli** - barcha kerakli ma'lumotlar
4. **Professional ko'rinish** - jadval va to'rtburchaklar
5. **Mijoz balansi** - oldingi va yangi
6. **Haydovchi ma'lumotlari** - yetkazib berish narxi
7. **Qopdagi dona** - har bir mahsulot uchun
8. **Rang kodlari** - qizil (qarz), yashil (kredit)

---

## 🚀 Keyingi Bosqich

### Qarz Muddatlari Qo'shish:
1. Customer modeliga qo'shish:
   - `debtDueDate` - qarz to'lash sanasi
   - `debtDays` - qarz muddati (kun)
   - `oldDebtDate` - eski qarz sanasi

2. Chekka qo'shish:
   - Eski qarz muddati
   - Yangi qarz muddati
   - Qolgan kunlar

3. Sales.tsx ga qo'shish:
   - Haydovchi tanlash dropdown
   - Haydovchi ma'lumotlarini saqlash
   - Yetkazib berish narxini hisoblash

---

## 📝 Eslatma

**Chek endi professional, ixcham va to'liq ma'lumotli!**

Barcha o'zgarishlar:
- ✅ Bitta varoqqa sig'adi
- ✅ Jadval ko'rinishida mahsulotlar
- ✅ Qopdagi dona soni
- ✅ Mijoz balansi (oldingi va yangi)
- ✅ Haydovchi ma'lumotlari
- ⏳ Qarz muddatlari (keyingi bosqich)

**Test fayl:** `test-receipt-compact.html`  
**Asosiy fayl:** `src/lib/receiptPrinter.ts`
