# AzizTrades ERP - API Hujjatlari

Base URL: `http://localhost:5000/api`

## Autentifikatsiya

Barcha API so'rovlar (login dan tashqari) JWT token talab qiladi.

Header:
```
Authorization: Bearer <token>
```

### POST /auth/login
Tizimga kirish

**Request:**
```json
{
  "email": "admin@aziztrades.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Admin",
    "email": "admin@aziztrades.com",
    "role": "ADMIN"
  }
}
```

### POST /auth/register
Yangi foydalanuvchi yaratish (Admin faqat)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "role": "SELLER"
}
```

## Mahsulotlar

### GET /products
Barcha mahsulotlarni olish

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "PET Preform 28mm",
    "bagType": "Katta qop",
    "unitsPerBag": 1000,
    "minStockLimit": 50,
    "optimalStock": 200,
    "maxCapacity": 500,
    "currentStock": 150,
    "pricePerBag": 250000,
    "productionCost": 200000,
    "batches": []
  }
]
```

### POST /products
Yangi mahsulot yaratish (Admin, Warehouse Manager)

**Request:**
```json
{
  "name": "PET Preform 28mm",
  "bagType": "Katta qop",
  "unitsPerBag": 1000,
  "minStockLimit": 50,
  "optimalStock": 200,
  "maxCapacity": 500,
  "pricePerBag": 250000,
  "productionCost": 200000
}
```

### PUT /products/:id
Mahsulotni yangilash (Admin, Warehouse Manager)

### POST /products/:id/batch
Partiya qo'shish (Admin, Warehouse Manager)

**Request:**
```json
{
  "quantity": 100,
  "productionDate": "2024-02-20",
  "shift": "Kunduzgi",
  "responsiblePerson": "Aziz Karimov"
}
```

### GET /products/alerts
Kam zaxira ogohlantirishlarini olish

## Sotuvlar

### GET /sales
Sotuvlar ro'yxati

### POST /sales
Yangi sotuv yaratish

**Request:**
```json
{
  "customerId": "uuid",
  "currency": "UZS",
  "items": [
    {
      "productId": "uuid",
      "quantity": 10,
      "pricePerBag": 250000
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "customerId": "uuid",
  "userId": "uuid",
  "totalAmount": 2500000,
  "currency": "UZS",
  "createdAt": "2024-02-20T10:00:00Z",
  "items": [],
  "customer": {}
}
```

## Mijozlar

### GET /customers
Mijozlar ro'yxati

### POST /customers
Yangi mijoz yaratish

**Request:**
```json
{
  "name": "Toshkent Savdo",
  "email": "toshkent@example.com",
  "phone": "+998901234567",
  "category": "VIP"
}
```

### GET /customers/:id
Mijoz ma'lumotlari

### POST /customers/:id/payment
To'lov qabul qilish

**Request:**
```json
{
  "amount": 1000000,
  "currency": "UZS",
  "description": "Qarz to'lovi"
}
```

### GET /customers/alerts/overdue
Muddati o'tgan mijozlar

## Xarajatlar

### GET /expenses
Xarajatlar ro'yxati

**Query Parameters:**
- `startDate`: Boshlanish sanasi
- `endDate`: Tugash sanasi
- `category`: Kategoriya
- `currency`: Valyuta

### POST /expenses
Yangi xarajat qo'shish (Admin, Accountant)

**Request:**
```json
{
  "category": "SALARY",
  "amount": 5000000,
  "currency": "UZS",
  "description": "Oylik maosh"
}
```

### GET /expenses/summary
Xarajatlar xulosasi

## Dashboard

### GET /dashboard/stats
Dashboard statistikasi

**Response:**
```json
{
  "dailyRevenue": 10000000,
  "monthlyRevenue": 250000000,
  "netProfit": 50000000,
  "totalExpenses": 200000000,
  "totalDebt": 15000000,
  "topProducts": [],
  "topCustomers": [],
  "lowStock": []
}
```

## Prognoz

### GET /forecast/overview
Barcha mahsulotlar prognozi

### GET /forecast/demand/:productId
Mahsulot prognozi

**Response:**
```json
{
  "productId": "uuid",
  "productName": "PET Preform 28mm",
  "currentStock": 150,
  "avgDailyDemand": 5.5,
  "daysUntilStockout": 27,
  "monthlyForecast": 165,
  "recommendedProduction": 15,
  "velocity": "fast"
}
```

## Hisobotlar

### GET /reports/sales-summary
Sotuvlar hisoboti

**Query Parameters:**
- `startDate`: Boshlanish sanasi
- `endDate`: Tugash sanasi

### GET /reports/inventory
Inventar hisoboti

### GET /reports/customer-analysis
Mijozlar tahlili

### GET /reports/profit-loss
Foyda/Zarar hisoboti

## Foydalanuvchilar (Admin faqat)

### GET /users
Foydalanuvchilar ro'yxati

### PUT /users/:id
Foydalanuvchini yangilash

### DELETE /users/:id
Foydalanuvchini o'chirish

## Audit Logs (Admin faqat)

### GET /audit-logs
Audit loglar ro'yxati

## Xato Kodlari

- `200` - Muvaffaqiyatli
- `201` - Yaratildi
- `400` - Noto'g'ri so'rov
- `401` - Autentifikatsiya talab qilinadi
- `403` - Ruxsat yo'q
- `404` - Topilmadi
- `429` - Juda ko'p so'rovlar
- `500` - Server xatosi

## Rate Limiting

- Maksimal: 100 so'rov / daqiqa
- IP manzil bo'yicha

## Xavfsizlik

- HTTPS dan foydalaning (production da)
- JWT token 7 kun amal qiladi
- Parollar bcrypt bilan shifrlangan
- CORS sozlangan
- Input validation (Zod)
