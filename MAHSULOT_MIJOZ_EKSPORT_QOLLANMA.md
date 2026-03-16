# MAHSULOT VA MIJOZLARNI EKSPORT QILISH QOLLANMA

## 📋 UMUMIY MA'LUMOT

Ushbu tizim orqali mahsulotlar va mijozlar ma'lumotlarini turli formatlarda (Excel, CSV, JSON) eksport qilishingiz mumkin.

## 🚀 TEZKOR BOSHLASH

### 1. API orqali eksport qilish

```bash
# Mahsulotlarni Excel formatida eksport qilish
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/export/products?format=excel"

# Mijozlarni CSV formatida eksport qilish
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/export/customers?format=csv"

# Barcha ma'lumotlarni JSON formatida eksport qilish
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/export/all?format=json"
```

### 2. Telegram Bot orqali

Logistika botidan foydalaning:
- `/export` - Eksport menyusi
- `/low-stock` - Kam zaxiradagi mahsulotlar
- `/out-of-stock` - Zaxirasi tugagan mahsulotlar
- `/debtors` - Qarzdor mijozlar
- `/vip` - VIP mijozlar
- `/active` - Faol mijozlar

## 📊 EKPORT TURLARI

### Mahsulotlar eksporti

**URL:** `/api/export/products`

**Parametrlar:**
- `format`: `json`, `excel`, `csv`
- `includeRelations`: `true`/`false` - Bog'liq ma'lumotlarni qo'shish
- `status`: `low_stock`, `out_of_stock`, `normal`
- `startDate`: Sana boshlanishi (YYYY-MM-DD)
- `endDate`: Sana tugashi (YYYY-MM-DD)

**Misol:**
```
/api/export/products?format=excel&includeRelations=true&status=low_stock
```

**Qaytadigan ustunlar:**
- ID, Nomi, Qop turi, Qopdagi donalar soni
- Minimal zaxira, Optimal zaxira, Maksimal sig'im
- Joriy zaxira (qop), Joriy zaxira (dona)
- Narx qop uchun, Ishlab chiqarish narxi
- Yaratilgan sana, Yangilangan sana

### Mijozlar eksporti

**URL:** `/api/export/customers`

**Parametrlar:**
- `format`: `json`, `excel`, `csv`
- `includeRelations`: `true`/`false`
- `category`: `VIP`, `NORMAL`, `RISK`
- `minAmount`: Minimal qarz summasi
- `maxAmount`: Maksimal qarz summasi
- `startDate`: Sana boshlanishi
- `endDate`: Sana tugashi

**Misol:**
```
/api/export/customers?format=excel&category=VIP&minAmount=100000
```

**Qaytadigan ustunlar:**
- ID, Ismi, Email, Telefon, Manzil
- Telegram Chat ID, Telegram username
- Eslatmalar yoqilgan, Qarz eslatma kunlari
- To'lov muddati, Chegirma foizi
- Balans, Qarz, Kredit limiti, Kategoriya
- Ohirgi xarid, Ohirgi to'lov
- Yaratilgan sana, Yangilangan sana

## 🎯 TEZKOR EKSPORT PRESETLAR

**URL:** `/api/export/quick/{type}`

**Turlar:**
- `low-stock-products` - Kam zaxiradagi mahsulotlar
- `out-of-stock-products` - Zaxirasi tugagan mahsulotlar
- `customers-with-debt` - Qarzdor mijozlar
- `vip-customers` - VIP mijozlar
- `active-customers` - Faol mijozlar (30 kun ichida)

**Misol:**
```
/api/export/quick/low-stock-products?format=excel
```

## 📈 STATISTIKA

**URL:** `/api/export/statistics`

**Qaytadigan ma'lumotlar:**
```json
{
  "products": {
    "total": 150,
    "lowStock": 25,
    "outOfStock": 5,
    "normal": 120
  },
  "customers": {
    "total": 500,
    "withDebt": 120,
    "active": 200,
    "inactive": 300
  },
  "exportDate": "2026-03-13T10:00:00.000Z"
}
```

## 🔐 RUHSATLAR

- **ADMIN**: Barcha eksport funktsiyalari
- **MANAGER**: Mahsulotlar va mijozlar eksporti
- **SELLER**: Faqat o'z ma'lumotlari bo'yicha eksport

## 📱 TELEGRAM BOT INTEGRATSIYASI

Logistika botidan eksport qilish uchun:

1. Botga kirish
2. `/export` buyrug'ini yuborish
3. Kerakli bo'limni tanlash:
   - 📦 Mahsulotlar
   - 👥 Mijozlar
   - 📊 Statistika

Bot sizga quyidagi imkoniyatlarni beradi:
- Veb-saytga tezkor o'tish
- API hujjatlarini ko'rish
- To'g'ridan-to'g'ri Excel faylni yuklash

## 🛠️ TEXNIK TALABLAR

**Paketlar:**
- `xlsx` - Excel fayllarini yaratish uchun
- `@types/xlsx` - TypeScript tipi

**Server talablari:**
- Node.js 16+
- Express.js
- Prisma Client
- Autentifikatsiya middleware

## 📁 FAYL FORMATLARI

### Excel (.xlsx)
- Professional ko'rinish
- Avtomatik ustun kengliklari
- Formatlangan sanalar
- Barcha ma'lumotlar bir varaqda

### CSV (.csv)
- Excel bilan mos
- Kichik fayl hajmi
- Tezkor yuklash
- UTF-8 kodlash

### JSON (.json)
- To'liq ma'lumotlar
- Bog'liq ma'lumotlar
- Ilovalar uchun mos
- API integratsiyasi

## 🔧 MISOL KODLAR

### JavaScript/TypeScript

```javascript
// Mahsulotlarni eksport qilish
const exportProducts = async () => {
  const response = await fetch('/api/export/products?format=excel', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mahsulotlar.xlsx';
  a.click();
};

// Mijozlarni eksport qilish
const exportCustomers = async () => {
  const response = await fetch('/api/export/customers?format=csv', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const text = await response.text();
  const blob = new Blob([text], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mijozlar.csv';
  a.click();
};
```

### Python

```python
import requests

# Mahsulotlarni eksport qilish
def export_products():
    headers = {'Authorization': f'Bearer {token}'}
    params = {'format': 'excel', 'includeRelations': 'true'}
    
    response = requests.get(
        'http://localhost:5000/api/export/products',
        headers=headers,
        params=params
    )
    
    with open('mahsulotlar.xlsx', 'wb') as f:
        f.write(response.content)

# Mijozlarni eksport qilish
def export_customers():
    headers = {'Authorization': f'Bearer {token}'}
    params = {'format': 'csv', 'category': 'VIP'}
    
    response = requests.get(
        'http://localhost:5000/api/export/customers',
        headers=headers,
        params=params
    )
    
    with open('vip_mijozlar.csv', 'w', encoding='utf-8') as f:
        f.write(response.text)
```

## 🚨 XATOLIKLAR VA YECIMLARI

### 403 Forbidden
**Sababi:** Ruxsat yo'q
**Yechimi:** Admin yoki manager rolida ekanligingizni tekshiring

### 500 Internal Server Error
**Sababi:** Server xatolik
**Yechimi:** Loglarni tekshiring, ma'lumotlar bazasi ulanishini tekshiring

### 400 Bad Request
**Sababi:** Noto'g'ri parametrlar
**Yechimi:** Parametrlarni tekshiring, format to'g'ri ekanligiga ishonch hosil qiling

## 📞 YORDAM

Qo'shimcha savollar uchun:
- 📧 Email: admin@aziztrades.com
- 📱 Telegram: @admin
- 🌐 Veb-sayt: http://localhost:3000
- 📚 API hujjatlar: http://localhost:5000/api/export/statistics

---

**Eslatma:** Eksport qilishdan oldin ma'lumotlarni tekshiring, ayniqsa katta ma'lumotlar bazalarida eksport jarayoni uzoq vaqt talab qilishi mumkin.
