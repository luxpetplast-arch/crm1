# 🛒 MULTI-PRODUCT SOTUV TIZIMI

## ✅ MAVJUD XUSUSIYATLAR

Tizimda allaqachon bir nechta mahsulot bilan sotuv qilish imkoniyati mavjud!

### Misol: 254ml + 45ml bir vaqtda sotish

**Qanday ishlaydi:**
1. Saytga kiring: http://localhost:3000
2. "Sales" sahifasiga o'ting
3. "Yangi Multi-Sotuv" tugmasini bosing
4. Mijozni tanlang
5. Birinchi mahsulotni qo'shing (254ml)
6. Ikkinchi mahsulotni qo'shing (45ml)
7. To'lovni kiriting
8. Saqlang

---

## 📋 QADAMMA-QADAM QOLLANMA

### 1. Mijozni Tanlash
```
👤 Mijoz: [Qidiruv...]
```
- Mijoz nomini yozing
- Ro'yxatdan tanlang

### 2. Mahsulotlarni Qo'shish

**Birinchi mahsulot (254ml):**
```
📦 Mahsulot: PET Preform 254ml
📊 Miqdor: 10 qop
💰 Narx: 50.00 $/qop
➕ Qo'shish
```

**Ikkinchi mahsulot (45ml):**
```
📦 Mahsulot: PET Preform 45ml
📊 Miqdor: 5 qop
💰 Narx: 30.00 $/qop
➕ Qo'shish
```

### 3. Qo'shilgan Mahsulotlar
```
✅ PET Preform 254ml
   10 qop × $50.00 = $500.00

✅ PET Preform 45ml
   5 qop × $30.00 = $150.00

💵 JAMI: $650.00
```

### 4. To'lov
```
💵 UZS: 0
💵 USD: 650.00
💵 CLICK: 0

✅ To'liq to'landi
```

### 5. Saqlash
```
[💾 Saqlash]
```

---

## 🎯 XUSUSIYATLAR

### ✅ Bir Nechta Mahsulot
- Cheksiz mahsulot qo'shish
- Har bir mahsulot alohida
- Miqdor va narx har biri uchun

### ✅ 3 Xil Valyuta
- UZS (so'm)
- USD (dollar)
- CLICK (to'lov tizimi)

### ✅ Avtomatik Hisoblash
- Har bir mahsulot summasi
- Jami summa
- To'langan summa
- Qarz summasi

### ✅ Ombor Nazorati
- Avtomatik ombor kamayishi
- Har bir mahsulot uchun
- Real-time yangilanish

---

## 📊 BACKEND API

### Endpoint: POST /api/sales

**Request:**
```json
{
  "customerId": "abc123",
  "items": [
    {
      "productId": "prod1",
      "quantity": 10,
      "pricePerBag": 50.00
    },
    {
      "productId": "prod2",
      "quantity": 5,
      "pricePerBag": 30.00
    }
  ],
  "totalAmount": 650.00,
  "paidAmount": 650.00,
  "currency": "USD",
  "paymentStatus": "PAID",
  "paymentDetails": {
    "uzs": 0,
    "usd": 650.00,
    "click": 0
  }
}
```

**Response:**
```json
{
  "id": "sale123",
  "saleNumber": "SALE-1773208123456",
  "customerId": "abc123",
  "items": [...],
  "totalAmount": 650.00,
  "paidAmount": 650.00,
  "status": "COMPLETED"
}
```

---

## 🧪 TEST QILISH

### 1. Saytni Oching
```
http://localhost:3000
```

### 2. Login Qiling
```
Email: admin@aziztrades.com
Password: admin123
```

### 3. Sales Sahifasiga O'ting
```
Sidebar > 🛒 Sales
```

### 4. Multi-Sotuv Yarating
```
1. "Yangi Multi-Sotuv" tugmasini bosing
2. Mijozni tanlang
3. 254ml mahsulotni qo'shing
4. 45ml mahsulotni qo'shing
5. To'lovni kiriting
6. Saqlang
```

---

## 📱 KEYBOARD SHORTCUTS

- `Ctrl + N` - Yangi sotuv
- `Esc` - Bekor qilish
- `Enter` - Saqlash (forma ichida)

---

## ✅ NATIJA

Multi-product sotuv tizimi to'liq ishlaydi!

**Misol:**
- 254ml: 10 qop × $50 = $500
- 45ml: 5 qop × $30 = $150
- **JAMI: $650**

---

**Tayyorlagan:** Kiro AI  
**Sana:** 2026-03-11  
**Status:** ✅ TAYYOR
