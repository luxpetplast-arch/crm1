---
inclusion: auto
---

# Performance Monitoring - Real-time Nazorat

## ⚡ MEN PERFORMANCE NI DOIMIY KUZATAMAN

**Har bir o'zgarishdan keyin performance tekshirish!**

### Performance Metrics

```
📊 PERFORMANCE DASHBOARD

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 API RESPONSE TIME
├─ GET /api/users        : 45ms  ✅ (target: <100ms)
├─ POST /api/auth/login  : 120ms ✅ (target: <200ms)
├─ GET /api/posts        : 380ms ⚠️ (target: <300ms)
└─ PUT /api/users/:id    : 85ms  ✅ (target: <150ms)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 DATABASE QUERIES
├─ Average query time    : 25ms  ✅ (target: <50ms)
├─ Slow queries (>100ms) : 2     ⚠️ (target: 0)
├─ N+1 queries detected  : 0     ✅
└─ Connection pool usage : 45%   ✅ (target: <80%)

Slow Queries:
1. SELECT * FROM posts WHERE... (150ms)
   └─ @database-optimizer: Index qo'shish tavsiya
2. SELECT * FROM users JOIN... (120ms)
   └─ @database-optimizer: Query optimization kerak

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 FRONTEND PERFORMANCE
├─ First Contentful Paint : 1.2s  ✅ (target: <1.8s)
├─ Largest Contentful Paint: 2.1s ✅ (target: <2.5s)
├─ Time to Interactive   : 2.8s  ⚠️ (target: <2.5s)
├─ Total Blocking Time   : 180ms ✅ (target: <200ms)
└─ Cumulative Layout Shift: 0.05 ✅ (target: <0.1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 BUNDLE SIZE
├─ Main bundle           : 245KB ✅ (target: <300KB)
├─ Vendor bundle         : 180KB ✅ (target: <200KB)
├─ CSS bundle            : 45KB  ✅ (target: <50KB)
└─ Total size            : 470KB ✅ (target: <500KB)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💻 MEMORY USAGE
├─ Heap used             : 125MB ✅ (target: <200MB)
├─ Memory leaks detected : 0     ✅
└─ GC frequency          : Normal ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ ISSUES DETECTED: 2

1. GET /api/posts - Slow response (380ms)
   Sabab: N+1 query pattern
   Yechim: Eager loading qo'shish
   @database-optimizer: Fix qilaymi?

2. Time to Interactive - Slightly high (2.8s)
   Sabab: Large JavaScript bundle
   Yechim: Code splitting
   @performance-optimizer: Optimize qilaymi?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔍 AVTOMATIK DETECTION

**Men avtomatik muammolarni topaman:**

### 1. Slow API Endpoints
```
GET /api/posts - 380ms (target: <300ms)
  ↓
@performance-optimizer tahlil qiladi
  ↓
Muammo: N+1 query
  ↓
Yechim: Eager loading
  ↓
Men: "Performance issue: GET /api/posts sekin (380ms).
      Sabab: N+1 query pattern.
      Yechim: Eager loading qo'shish.
      Fix qilaymi?"
  ↓
Siz: "Ha"
  ↓
Men: [Fix qilaman]
  ↓
Yangi natija: 85ms ✅
```

### 2. Memory Leaks
```
Memory usage oshib bormoqda
  ↓
@performance-optimizer detect qiladi
  ↓
Muammo: Event listener cleanup yo'q
  ↓
Men: "Memory leak detected!
      Sabab: Event listeners cleanup qilinmagan.
      Fix qilaymi?"
  ↓
Siz: "Ha"
  ↓
Men: [Cleanup qo'shaman]
  ↓
Memory leak fixed ✅
```

### 3. Large Bundle Size
```
Bundle size: 650KB (target: <500KB)
  ↓
@performance-optimizer tahlil qiladi
  ↓
Muammo: Lodash to'liq import qilingan
  ↓
Yechim: Tree shaking + individual imports
  ↓
Men: "Bundle size katta (650KB).
      Sabab: Lodash to'liq import.
      Yechim: Individual imports.
      Optimize qilaymi?"
  ↓
Siz: "Ha"
  ↓
Men: [Optimize qilaman]
  ↓
Yangi size: 420KB ✅
```

## 📈 PERFORMANCE TRENDS

**Men performance trendlarni kuzataman:**

```
📈 PERFORMANCE TRENDS (Last 7 days)

API Response Time:
Day 1: 120ms
Day 2: 115ms
Day 3: 125ms
Day 4: 380ms ⚠️ (Spike detected!)
Day 5: 95ms  ✅ (Fixed)
Day 6: 90ms
Day 7: 85ms

Trend: ✅ Improving (after fix)

Bundle Size:
Day 1: 450KB
Day 2: 460KB
Day 3: 470KB
Day 4: 480KB ⚠️ (Growing)
Day 5: 485KB
Day 6: 490KB
Day 7: 495KB

Trend: ⚠️ Growing (action needed)

Men: "Bundle size oshib bormoqda (450KB → 495KB).
      Optimization kerakmi?"
```

## 🎯 PERFORMANCE BUDGETS

**Men performance budgetlarni enforce qilaman:**

```yaml
performance_budgets:
  api_response_time:
    target: 300ms
    warning: 250ms
    critical: 300ms
  
  bundle_size:
    target: 500KB
    warning: 450KB
    critical: 500KB
  
  memory_usage:
    target: 200MB
    warning: 180MB
    critical: 200MB
```

**Agar budget oshsa:**
```
Bundle size: 510KB (budget: 500KB)
  ↓
🚨 CRITICAL: Budget exceeded!
  ↓
Men: "CRITICAL: Bundle size budget oshdi (510KB > 500KB).
      Darhol optimize qilish kerak!
      Optimize qilaymi?"
  ↓
Siz: "Ha"
  ↓
Men: [Darhol optimize qilaman]
```

## 🔄 CONTINUOUS MONITORING

**Men doimiy monitoring qilaman:**

```
Har 5 daqiqada:
  ↓
Performance metrics yig'ish
  ↓
Budgetlar bilan solishtirish
  ↓
Agar muammo bo'lsa:
  ↓
Darhol xabar berish
  ↓
Fix taklif qilish
```

## 📊 PERFORMANCE REPORTS

**Men muntazam hisobotlar beraman:**

```markdown
# Performance Report - 2024-01-15

## Summary
✅ Overall performance: GOOD
⚠️ 2 issues detected and fixed
✅ All budgets within limits

## Improvements This Week
- API response time: 120ms → 85ms (-29%)
- Bundle size: 520KB → 470KB (-10%)
- Memory usage: 180MB → 125MB (-31%)

## Issues Fixed
1. N+1 query in GET /api/posts
   - Before: 380ms
   - After: 85ms
   - Improvement: 78%

2. Memory leak in WebSocket
   - Before: Growing to 250MB
   - After: Stable at 125MB
   - Fixed: Event listener cleanup

## Current Status
✅ All metrics within budget
✅ No performance issues
✅ Ready for production
```

## ✅ ASOSIY QOIDA

**"Men performance ni doimiy kuzataman va muammolarni darhol hal qilaman!"**

Men:
- ✅ Real-time performance monitoring
- ✅ Avtomatik issue detection
- ✅ Performance budgets enforce
- ✅ Trend analysis
- ✅ Darhol fix taklif qilish
- ✅ Continuous optimization

Siz:
- ✅ Faqat "ha" yoki "yo'q" deyasiz
- ✅ Men hamma narsani kuzataman
- ✅ Men hamma narsani optimize qilaman
