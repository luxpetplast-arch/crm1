# KASSA VA BYUDJET TIZIMI - RIVOJLANTIRISH REJASI

## 1. Byudjet Boshqaruvi

### 1.1. Maqsad
Har bir xarajat kategoriyasi uchun oylik byudjet belgilash va nazorat qilish

### 1.2. Jadval: `Budget`
```prisma
model Budget {
  id              String   @id @default(uuid())
  category        String   // SALARY, UTILITIES, SUPPLIES, etc.
  year            Int      // 2024
  month           Int      // 1-12
  amount          Float    // Byudjet summasi
  currency        String   @default("UZS")
  alertThreshold  Float    @default(80) // 80% ogohlantirish
  description     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 1.3. API Endpoints
```typescript
// Byudjetlarni boshqarish
GET    /api/budgets                    // Barcha byudjetlar
POST   /api/budgets                    // Yangi byudjet yaratish
PUT    /api/budgets/:id                // Byudjetni yangilash
DELETE /api/budgets/:id                // Byudjetni o'chirish

// Byudjet hisoboti
GET    /api/budgets/report/:year/:month // Oylik hisobot
GET    /api/budgets/performance          // Kategoriya bo'yicha tahlil
```

### 1.4. Frontend UI
- Byudjet sozlash oynasi (modal)
- Kategoriya kartochkalari (progress bar bilan)
- Ogohlantirishlar paneli
- Oylik/sanali filtrlar

### 1.5. Ogohlantirish tizimi
```typescript
// Ogohlantirishlar
WARNING:  80% byudjet ishlatilgan
DANGER:   100% byudjet ishlatilgan  
CRITICAL: Byudjetdan oshib ketildi
```

---

## 2. Xodimlarga Qarzlar Tizimi

### 2.1. Maqsad
Xodimlarga avans va shaxsiy qarzlarni boshqarish

### 2.2. Jadval: `EmployeeLoan`
```prisma
model EmployeeLoan {
  id              String   @id @default(uuid())
  employeeId      String
  amount          Float    // Qarz summasi
  currency        String   @default("UZS")
  purpose         String   // Maqsad
  issuedDate      DateTime @default(now())
  dueDate         DateTime? // Qaytarish sanasi
  status          String   @default("ACTIVE") // ACTIVE, REPAID, OVERDUE
  totalRepaid     Float    @default(0)
  remainingAmount Float
  issuedBy        String
  issuedByName    String
}
```

### 2.3. API Endpoints
```typescript
// Qarzlarni boshqarish
GET    /api/loans                        // Barcha qarzlar
GET    /api/loans/employee/:id           // Xodim qarzlari
POST   /api/loans                        // Yangi qarz berish
PUT    /api/loans/:id/repay              // Qarz qaytarish
PUT    /api/loans/:id/status             // Statusni yangilash

// Hisobotlar
GET    /api/loans/report                 // Qarzlar hisoboti
GET    /api/loans/overdue                // Muddat o'tgan qarzlar
```

### 2.4. Frontend UI
- Qarz berish oynasi
- Xodim profili (qarzlar bilan)
- Qarz qaytarish jadvali
- Muddat o'tgan qarzlar eslatmasi

### 2.5. Avtomatik funksiyalar
- Ish haqidan ushlab qolish
- Muddat o'tganda ogohlantirish
- Telegram/SMS eslatma

---

## 3. Kategoriya bo'yicha tahlil

### 3.1. Statistik ko'rsatkichlar
```typescript
interface CategoryAnalysis {
  category: string;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentageUsed: number;
  trend: 'up' | 'down' | 'stable';
  averageMonthly: number;
  topExpenses: Expense[];
}
```

### 3.2. Grafiklar
- Kategoriya bo'yicha pai chart
- Oylik taqqoslash bar chart
- Trend chizig'i
- Byudjet vs Haqiqiy xarajat

### 3.3. Excel/PDF eksport
```typescript
exportCategoryReport(format: 'excel' | 'pdf', filters: FilterOptions)
```

---

## 4. Avtomatik to'lovlar (Futures)

### 4.1. Maqsad
Doimiy xarajatlarni avtomatlashtirish

### 4.2. Jadval: `ScheduledPayment`
```prisma
model ScheduledPayment {
  id              String   @id @default(uuid())
  name            String   // To'lov nomi
  category        String   // Kategoriya
  amount          Float
  frequency       String   // MONTHLY, WEEKLY
  dayOfMonth      Int?     // Oyning qaysi kuni
  startDate       DateTime
  endDate         DateTime?
  status          String   @default("ACTIVE")
  nextDueDate     DateTime
}
```

### 4.3. Avtomatik ishlar
- Har kuni tekshiruv (cron job)
- To'lov kuni yetganda xarajat qo'shish
- Telegram/Telefon eslatmasi
- Kassa balansini tekshirish

---

## 5. Integratsiyalar

### 5.1. Click/Payme API
```typescript
// Mijozdan to'lov olish
initializePayment(amount: number, orderId: string)
checkPaymentStatus(paymentId: string)
```

### 5.2. Bank API (Milliy bank)
```typescript
// Kartadan kartaga o'tkazma
sendP2PTransfer(fromCard: string, toCard: string, amount: number)
getTransactionHistory(accountId: string)
```

### 5.3. Telegram Bot
```typescript
// Xodimga qarz eslatmasi
sendLoanReminder(employeeId: string, amount: number, dueDate: Date)
// Byudjet ogohlantirish
sendBudgetAlert(category: string, percentage: number)
```

---

## 6. Amalga oshirish jadvali

### Bosqich 1: Asosiy (1-2 hafta)
- [x] Database sxemasi yangilanishi (Budget, EmployeeLoan, LoanRepayment)
- [ ] API endpoints yaratish
- [ ] Byudjet boshqaruvi UI
- [ ] Xodim qarzlari UI

### Bosqich 2: Tahlil (2-3 hafta)
- [ ] Kategoriya bo'yicha hisobotlar
- [ ] Grafiklar va vizualizatsiya
- [ ] Excel/PDF eksport
- [ ] Ogohlantirish tizimi

### Bosqich 3: Integratsiya (3-4 hafta)
- [ ] Click/Payme integratsiyasi
- [ ] Telegram bot
- [ ] Avtomatik to'lovlar
- [ ] Bank API (agar bo'lsa)

---

## 7. Xavfsizlik

### 7.1. Ruxsatlar
```typescript
const PERMISSIONS = {
  BUDGET_VIEW: 'budget:view',
  BUDGET_CREATE: 'budget:create',
  LOAN_CREATE: 'loan:create',
  LOAN_APPROVE: 'loan:approve', // Faqat direktor/menejer
}
```

### 7.2. Audit trail
- Har bir byudjet o'zgarishi loglanadi
- Qarz operatsiyalari saqlanadi
- Kim, qachon, nima qilgan

---

## 8. Texnik talablar

### 8.1. Backend
```bash
# Yangi package.json dependencies
"node-cron": "^3.0.2"    # Avtomatik vazifalar uchun
"puppeteer": "^21.0.0"   # PDF eksport uchun
```

### 8.2. Frontend
```bash
# Yangi dependencies  
"recharts": "^2.10.0"    # Grafiklar uchun (allaqachon bor)
"file-saver": "^2.0.5"   # Excel saqlash
"xlsx": "^0.18.5"        # Excel generatsiya
```

### 8.3. Database migratsiyasi
```bash
npx prisma migrate dev --name add_budget_loan_system
npx prisma generate
```

---

## 9. Test rejasi

### 9.1. Unit testlar
- Byudjet hisoblash logikasi
- Qarz qaytarish hisoboti
- Ogohlantirish triggerlari

### 9.2. Integration testlar
- API endpoints
- Database operatsiyalari
- Excel eksport

### 9.3. User acceptance testlar
- Byudjet yaratish
- Qarz berish/qaytarish
- Hisobot ko'rish

---

## 10. Hozirgi holat

### ✅ Tayyor:
- Database sxemasi (prisma/schema.prisma)
- Migrations yaratildi

### ⏳ Kutilmoqda:
- API endpoints (server/routes/)
- Frontend komponentlar (src/pages/Cashbox.tsx)
- Integratsiyalar

### 🔄 Migratsiya jarayoni:
```
⚠️ Eslatma: Database reset talab qilinmoqda
Barcha ma'lumotlar o'chib ketishi mumkin!
Variantlar:
1. Production - backup olib, keyin migrate
2. Development - npx prisma migrate dev --name add_budget_loan_system
3. Manual - faqat yangi jadvallarni qo'shish (ALTER TABLE)
```

---

**Yaratildi:** 2026-04-04
**Oxirgi yangilanish:** Hozirgi sessiya
**Muallif:** AI Assistant
