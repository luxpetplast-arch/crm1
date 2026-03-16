# Kiro Sub-Agents - Professional Development Workflow

## O'rnatilgan Maxsus Agentlar

### 1. 🔍 Code Reviewer Agent
**Fayl:** `code-reviewer.md`

**Vazifasi:**
- Kod sifatini tahlil qiladi
- Best practices va standartlarni tekshiradi
- Bug va logic xatolarni topadi
- Refactoring takliflari beradi
- Dokumentatsiya to'liqligini tekshiradi

**Qachon ishlatish:**
```
@code-reviewer src/auth.js faylini ko'rib chiq
@code-reviewer Oxirgi o'zgarishlarni review qil
```

**Hook bilan avtomatik:** `auto-code-review.json` - Kod yozilganidan keyin avtomatik ishlaydi

---

### 2. 🔒 Security Auditor Agent
**Fayl:** `security-auditor.md`

**Vazifasi:**
- SQL injection, XSS, CSRF tekshiruvi
- Hardcoded secrets topish
- Authentication/Authorization muammolarini aniqlash
- API xavfsizligini tekshirish
- Vulnerable dependencies topish

**Qachon ishlatish:**
```
@security-auditor API endpointlarni tekshir
@security-auditor Butun loyihani audit qil
```

**Hook bilan avtomatik:** `auto-security-scan.json` - Kod yozilganidan keyin avtomatik ishlaydi

---

### 3. ⚡ Performance Optimizer Agent
**Fayl:** `performance-optimizer.md`

**Vazifasi:**
- Performance bottlenecks topish
- N+1 query muammolarini aniqlash
- Caching strategiyalarini taklif qilish
- Algorithm optimizatsiyasi
- Bundle size va lazy loading tekshiruvi

**Qachon ishlatish:**
```
@performance-optimizer Database querylarni tahlil qil
@performance-optimizer Frontend performance yaxshila
```

**Hook bilan avtomatik:** `performance-check.json` - Qo'lda ishga tushirasiz

---

### 4. 🧪 Test Coverage Analyzer Agent
**Fayl:** `test-coverage-analyzer.md`

**Vazifasi:**
- Test coverage tahlili
- Untested kod topish
- Edge case va critical path test takliflari
- Test quality review
- Test anti-patterns aniqlash
- Testing strategy tavsiyalari

**Qachon ishlatish:**
```
@test-coverage-analyzer src/services/ uchun test yoz
@test-coverage-analyzer Test coverage tahlil qil
```

---

### 5. 📚 Documentation Writer Agent
**Fayl:** `documentation-writer.md`

**Vazifasi:**
- Code documentation (JSDoc, docstrings)
- API documentation yaratish
- README va guide yozish
- Changelog va release notes
- Documentation yangilab turish

**Qachon ishlatish:**
```
@documentation-writer API uchun dokumentatsiya yoz
@documentation-writer README yaratish kerak
```

---

### 6. 🗄️ Database Optimizer Agent
**Fayl:** `database-optimizer.md`

**Vazifasi:**
- Database schema review
- Index optimization (missing/unused indexes)
- N+1 query detection
- Query performance tahlili
- Migration strategiyalari
- SQL injection prevention

**Qachon ishlatish:**
```
@database-optimizer Schema dizaynni ko'rib chiq
@database-optimizer Query performance yaxshila
```

---

### 4. 🧪 Test Coverage Analyzer Agent
**Fayl:** `test-coverage-analyzer.md`

**Vazifasi:**
- Test coverage tahlili
- Untested kod topish
- Edge case va critical path test takliflari
- Test quality review
- Test anti-patterns aniqlash
- Testing strategy tavsiyalari

**Qachon ishlatish:**
```
@test-coverage-analyzer src/services/ uchun test yoz
@test-coverage-analyzer Test coverage tahlil qil
```

---

### 5. 📚 Documentation Writer Agent
**Fayl:** `documentation-writer.md`

**Vazifasi:**
- Code documentation (JSDoc, docstrings)
- API documentation yaratish
- README va guide yozish
- Changelog va release notes
- Documentation yangilab turish

**Qachon ishlatish:**
```
@documentation-writer API uchun dokumentatsiya yoz
@documentation-writer README yaratish kerak
```

---

### 6. 🗄️ Database Optimizer Agent
**Fayl:** `database-optimizer.md`

**Vazifasi:**
- Database schema review
- Index optimization (missing/unused indexes)
- N+1 query detection
- Query performance tahlili
- Migration strategiyalari
- SQL injection prevention

**Qachon ishlatish:**
```
@database-optimizer Schema dizaynni ko'rib chiq
@database-optimizer Query performance yaxshila
```

---

## Agentlarni Ishlatish Usullari

### 1. To'g'ridan-to'g'ri chaqirish
```
@code-reviewer src/components/Login.tsx ni ko'rib chiq
```

### 2. Hook orqali avtomatik
Kod yozganingizda avtomatik ishlaydi (agar hook yoqilgan bo'lsa)

### 3. Command Palette orqali
`Trigger Hook` → Agent hookini tanlang

---

## Agentlar Kombinatsiyasi

**Full Audit (To'liq tekshiruv):**
```
1. @code-reviewer - Kod sifatini tekshiradi
2. @security-auditor - Xavfsizlikni tekshiradi
3. @performance-optimizer - Performance tahlil qiladi
4. @test-coverage-analyzer - Test coverage tekshiradi
5. @database-optimizer - Database optimizatsiya qiladi
6. @documentation-writer - Dokumentatsiya yozadi
```

**Development Workflow:**
```
1. Kod yozish
2. @code-reviewer - Kod review
3. @test-coverage-analyzer - Test yozish
4. @documentation-writer - Dokumentatsiya
5. @security-auditor - Xavfsizlik
6. @performance-optimizer - Performance
7. @database-optimizer - Database (agar kerak bo'lsa)
```

---

## Hooklar va Agentlar Integratsiyasi

| Hook | Agent | Qachon ishlaydi |
|------|-------|-----------------|
| `auto-code-review.json` | code-reviewer | Kod yozilganidan keyin |
| `auto-security-scan.json` | security-auditor | Kod yozilganidan keyin |
| `performance-check.json` | performance-optimizer | Qo'lda ishga tushirish |

---

## Agentlarni O'chirish/Yoqish

**Hook o'chirish:**
```json
// .kiro/hooks/auto-code-review.json ichida
{
  "disabled": true  // Qo'shing
}
```

**Agentni o'chirish:**
Faylni o'chiring yoki `.md` faylni boshqa joyga ko'chiring

---

## Yangi Agent Yaratish

```
Men bilan gaplashing: "Yangi agent yaratmoqchiman - [vazifasi]"
```

Masalan:
- Database Migration Agent
- API Documentation Agent (✅ Mavjud: documentation-writer)
- Test Coverage Agent (✅ Mavjud: test-coverage-analyzer)
- Dependency Update Agent

---

## Professional Workflow

**Recommended workflow:**

1. **Development Phase:**
   - Kod yozing
   - Auto code review ishlaydi (hook)
   - Auto security scan ishlaydi (hook)

2. **Before Commit:**
   - Performance check ishga tushiring
   - Git commit helper ishga tushiring

3. **Before Deploy:**
   - Full audit (barcha 3 agent)
   - Test coverage tekshiruvi

---

## Maslahatlar

✅ **Do:**
- Agentlarni muntazam ishlatib turing
- Hook natijalarini o'qib chiqing
- Takliflarni amalga oshiring

❌ **Don't:**
- Barcha hooklarni bir vaqtda yoqmang (sekin ishlashi mumkin)
- Agent takliflarini ignore qilmang
- Xavfsizlik ogohlantirishlarini e'tiborsiz qoldirmang

---

## Yordam

Agar savollar bo'lsa:
```
@code-reviewer bu nima qiladi?
Agentlarni qanday sozlash kerak?
Yangi agent yaratish mumkinmi?
```

Men har doim yordam beraman! 🚀
