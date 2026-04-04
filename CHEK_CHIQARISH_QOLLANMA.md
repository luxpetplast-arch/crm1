# Chek Chiqarish Tizimi - To'liq Qo'llanma

**Sana:** 18 Mart 2026  
**Versiya:** 2.0 - Tuzatilgan

## 📋 Mundarija

1. [Tizim Arxitekturasi](#tizim-arxitekturasi)
2. [O'rnatish](#ornatish)
3. [Sozlash](#sozlash)
4. [Test Qilish](#test-qilish)
5. [Muammolarni Hal Qilish](#muammolarni-hal-qilish)
6. [API Hujjatlari](#api-hujjatlari)

## 🏗️ Tizim Arxitekturasi

### Komponentlar

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
│                 │
│ receiptPrinter  │
│     .ts         │
└────────┬────────┘
         │
         │ HTTP Request
         │ /api/print/receipt
         │
┌────────▼────────┐
│   Backend       │
│   (Express)     │
│                 │
│ routes/print.ts │
└────────┬────────┘
         │
         │ PowerShell
         │ Out-Printer
         │
┌────────▼────────┐
│   Printer       │
│ Xprinter XP-365B│
│   (80mm)        │
└─────────────────┘
```

### Ishlash Jarayoni

1. **Frontend:** Sotuv yaratilganda `printReceipt()` chaqiriladi
2. **Data Preparation:** `prepareSaleReceipt()` chek ma'lumotlarini tayyorlaydi
3. **Text Generation:** `generateTextReceipt()` 80mm format yaratadi
4. **API Call:** `/api/print/receipt` ga POST so'rov yuboriladi
5. **Backend Processing:** Temp fayl yaratiladi va printerga yuboriladi
6. **Printing:** PowerShell orqali printer chek chiqaradi
7. **Cleanup:** Temp fayl o'chiriladi

## 🔧 O'rnatish

### 1. Printer Sozlash

```powershell
# Printerlarni ko'rish
Get-Printer

# Xprinter XP-365B ni tekshirish
Get-Printer | Where-Object {$_.Name -like "*Xprinter*"}

# Printer holatini tekshirish
Get-Printer -Name "Xprinter XP-365B" | Select-Object Name, PrinterStatus, DriverName
```

### 2. Printer Nomi To'g'rilash

Agar printer nomi boshqacha bo'lsa, `server/routes/print.ts` faylida o'zgartiring:

```typescript
// 23-qator
await execAsync(`powershell -Command "Get-Content '${tempFile}' | Out-Printer -Name 'SIZNING_PRINTER_NOMI'"`);
```

### 3. Dependencies

```bash
# Backend dependencies allaqachon o'rnatilgan
# Express, child_process, fs, util
```

## ⚙️ Sozlash

### Frontend Sozlamalari

`src/lib/receiptPrinter.ts` faylida:

```typescript
// Printer sozlamalari
const width = 48; // 80mm paper width in characters

// Company info
companyInfo: {
  name: 'LUX PET PLAST',
  address: 'Toshkent sh., Chilonzor t.',
  phone: '+998 90 123 45 67',
  inn: '123456789'
}

// Exchange rate
exchangeRate: 12500 // 1 USD = 12,500 UZS
```

### Backend Sozlamalari

`server/routes/print.ts` faylida:

```typescript
// Printer nomi
const printerName = 'Xprinter XP-365B';

// Temp file cleanup delay
setTimeout(() => {
  fs.unlinkSync(tempFile);
}, 5000); // 5 soniya
```

## 🧪 Test Qilish

### 1. Printer Ulanganligini Tekshirish

```bash
node test-receipt-print.cjs
```

Natija:
```
🖨️ Chek chiqarish tizimini test qilish boshlandi...
1️⃣ Login qilish...
✅ Login muvaffaqiyatli
2️⃣ Test chek chiqarish...
✅ Test chek: {success: true, ...}
📄 Printerdan chek chiqishini tekshiring!
```

### 2. Test Fayllar

#### A. 80mm Test
```bash
node 80mm-test.js
```

#### B. 8cm Test
```bash
node 8cm-test.js
```

### 3. Browser Console Test

1. Saytga kiring: `http://localhost:5000`
2. Login qiling: `admin / admin123`
3. Browser Console ni oching (F12)
4. Sotuv yarating
5. Console loglarini kuzating:

```javascript
🖨️ printReceipt called with data: {...}
🖨️ printToPhysicalPrinter started
📄 Receipt text generated, length: 1234
📝 Temp file name: receipt-1773563104883.txt
📡 Sending print request to server...
📡 Server response status: 200
📡 Server response: {success: true, ...}
✅ Print request successful
✅ Chek avtomatik chop etildi
```

### 4. Server Logs Test

Server terminalda:

```
🖨️ Print request received: receipt-1773563104883.txt
📄 Receipt file created: ./receipt-1773563104883.txt
✅ Receipt sent to printer successfully
🗑️ Temp file cleaned up
```

## 🔍 Muammolarni Hal Qilish

### Muammo 1: Chek Chiqmayapti

**Belgilar:**
- Console da xatolik yo'q
- Server 200 qaytaradi
- Lekin printer chiqarmayapti

**Yechim:**

```powershell
# 1. Printer holatini tekshiring
Get-Printer -Name "Xprinter XP-365B"

# 2. Printer xizmatini qayta ishga tushiring
Restart-Service -Name Spooler

# 3. Test chop etish
echo "Test" | Out-Printer -Name "Xprinter XP-365B"
```

### Muammo 2: 401 Unauthorized

**Belgilar:**
```
❌ Server error response: Unauthorized
```

**Yechim:**

`src/lib/receiptPrinter.ts` da token qo'shilganligini tekshiring:

```typescript
const token = localStorage.getItem('token');
if (!token) {
  throw new Error('Authentication token not found');
}

const response = await fetch('/api/print/receipt', {
  headers: {
    'Authorization': `Bearer ${token}` // ✅ Bu qator bo'lishi kerak
  }
});
```

### Muammo 3: Printer Not Found

**Belgilar:**
```
❌ Printer not available or not configured
```

**Yechim:**

```powershell
# Barcha printerlarni ko'rish
Get-Printer | Select-Object Name

# To'g'ri nomni topish
Get-Printer | Where-Object {$_.Name -like "*XP*"}

# server/routes/print.ts da nomni o'zgartirish
# 23-qator: Out-Printer -Name 'TO\'G\'RI_NOM'
```

### Muammo 4: Popup Oyna Ochiladi

**Belgilar:**
- Avtomatik chop etish ishlamayapti
- Popup oyna ochiladi

**Yechim:**

Bu fallback mexanizm. Avtomatik chop etish ishlamasa, popup ochiladi.

Browser Console da xatolikni ko'ring:
```javascript
❌ printToPhysicalPrinter error: ...
⚠️ Popup oynasi ochilmoqda...
```

Xatolikni hal qiling va qayta urinib ko'ring.

### Muammo 5: Format Buzilgan

**Belgilar:**
- Chek chiqadi lekin format noto'g'ri
- Satrlar uzilgan yoki qo'shilgan

**Yechim:**

`src/lib/receiptPrinter.ts` da width ni sozlang:

```typescript
function generateTextReceipt(data: ReceiptData): string {
  const width = 48; // 80mm = 48 characters
  // Agar 58mm bo'lsa: width = 32
  // Agar 110mm bo'lsa: width = 64
}
```

## 📡 API Hujjatlari

### POST /api/print/receipt

Chek chiqarish uchun asosiy endpoint.

**Request:**
```json
{
  "content": "Chek matni...",
  "filename": "receipt-1773563104883.txt"
}
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Receipt printed successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Printer not available or not configured",
  "details": "Error details..."
}
```

### POST /api/print/test

Test chek chiqarish.

**Request:**
```json
{}
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Test print sent to printer"
}
```

## 📊 Chek Formati

### 80mm Qog'oz (48 belgi)

```
================================================
************************************************
*           LUX PET PLAST                      *
*         TOSHKENT DO'KONI                      *
************************************************
================================================
Sana: 18/03/2026              Vaqt: 14:30
Buyurtma: ORD-12345
Kassir: Admin
Mijoz: Test Mijoz
Tel: +998 90 123-45-67
------------------------------------------------
Kurs:                  1$ = 12,500 so'm
------------------------------------------------
Mahsulot            Soni     Narx      Jami
------------------------------------------------
Plastik qop 5kg        5   15,000    75,000
Plastik qop 10kg       3   25,000    75,000
------------------------------------------------
Jami: 8 ta
Summa:                              150,000 so'm
------------------------------------------------
TO'LOV:
Naqd (UZS):                         150,000 so'm
------------------------------------------------
To'langan:                          150,000 so'm
Qarz:                                     0 so'm
================================================
YANGI BALANS:                      -50,000 so'm
To'lash muddati:                      17/04/2026
================================================
************************************************
XARIDINGIZ UCHUN RAHMAT!
Qaytib kelishingizni kutamiz!
************************************************
================================================
ID: SLS-1773563104883
18/03/2026, 14:30:25
================================================
```

## 🎯 Xususiyatlar

### ✅ Mavjud Xususiyatlar

- Avtomatik chek chiqarish
- Fallback popup oyna
- 80mm qog'oz formati
- Dollar kursi ko'rsatish
- Mijoz balansi
- Qarz muddati
- Haydovchi ma'lumotlari
- To'lov tafsilotlari (UZS, USD, Karta)
- Mahsulot ro'yxati
- Company info
- Temp file auto cleanup

### 🔄 Keyingi Versiyalarda

- Multiple printer support
- Custom paper sizes
- Logo printing
- Barcode/QR code
- Email receipt option
- SMS notification
- Receipt history
- Reprint functionality

## 📞 Yordam

Agar muammo hal bo'lmasa:

1. Browser Console loglarini yuboring
2. Server terminal loglarini yuboring
3. Printer holatini yuboring:
   ```powershell
   Get-Printer -Name "Xprinter XP-365B" | Select-Object *
   ```

---

**Oxirgi yangilanish:** 18 Mart 2026  
**Versiya:** 2.0  
**Muallif:** AI Assistant
