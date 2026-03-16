# 🚀 Agent Optimization Guide

## ⚠️ Muammo: Ko'p Agent = Sekinlik

55 ta agent - bu **ko'p**! Lekin xavotir olmang, biz buni hal qildik.

---

## ✅ Yechim: Faqat Kerakli Agentlarni Ishlating

### 📊 Preset Bo'yicha Agent Soni

```
Startup MVP:     12 ta agent  ⚡ (Eng tez)
E-commerce:      18 ta agent  ⚡⚡
SaaS:            24 ta agent  ⚡⚡⚡
Enterprise:      55 ta agent  ⚡⚡⚡⚡ (To'liq)
```

---

## 🎯 Qaysi Preset Tanlash?

### 1️⃣ Startup MVP (12 agent) - TEZ RIVOJLANTIRISH

**Qachon ishlatish:**
- MVP yaratyapsiz
- Tez bozorga chiqish kerak
- Kichik jamoa (1-3 kishi)
- Oddiy loyiha

**Agentlar:**
```yaml
development:
  - code-generator
  - code-reviewer
  - react-specialist
  - nodejs-backend-specialist

testing:
  - integration-tester
  - unit-test-generator

quality:
  - security-auditor
  - performance-optimizer

deployment:
  - ci-cd-specialist
  - docker-specialist
```

**Natija:**
- ⚡ Juda tez
- 🎯 Asosiy funksiyalar
- 💰 Arzon (kam resurs)

---

### 2️⃣ E-commerce (18 agent) - SAVDO UCHUN

**Qachon ishlatish:**
- Online do'kon
- To'lov tizimi bor
- SEO muhim
- Konversiya muhim

**Qo'shimcha agentlar:**
```yaml
+ seo-optimizer          # SEO uchun
+ accessibility-checker  # Qonun talabi
+ frontend-optimizer     # Tezlik = konversiya
+ database-optimizer     # To'lovlar uchun
+ backup-manager         # Tranzaksiyalar uchun
+ secrets-manager        # To'lov kalitlari
```

**Natija:**
- ⚡⚡ Tez
- 🛒 E-commerce uchun optimallashtirilgan
- 🔒 Xavfsiz to'lovlar

---

### 3️⃣ SaaS (24 agent) - XIZMAT UCHUN

**Qachon ishlatish:**
- SaaS loyiha
- Multi-tenancy
- API-first
- Feature flags kerak

**Qo'shimcha agentlar:**
```yaml
+ api-versioning-manager      # API versiyalash
+ database-migration-manager  # Multi-tenant migrations
+ feature-manager             # Feature flags
+ monitoring-setup-specialist # SLA monitoring
+ load-balancer-optimizer     # Scalability
+ ab-test-manager            # Feature testing
+ notification-manager        # User notifications
```

**Natija:**
- ⚡⚡⚡ Yaxshi tezlik
- 🌐 SaaS uchun optimallashtirilgan
- 📈 Scalable

---

### 4️⃣ Enterprise (55 agent) - TO'LIQ TIZIM

**Qachon ishlatish:**
- Katta loyiha
- Katta jamoa (10+ kishi)
- Qattiq talablar
- To'liq quality gates

**Barcha agentlar:**
- Barcha 55 ta agent yoqilgan
- Eng qattiq quality gates
- To'liq monitoring
- To'liq dokumentatsiya

**Natija:**
- ⚡⚡⚡⚡ Yetarli tez
- 🏢 Enterprise darajasi
- ✅ Maksimal sifat

---

## 🎯 Qanday Tanlash?

### Oddiy Test:

**1. Jamoa hajmi?**
- 1-3 kishi → Startup MVP
- 3-10 kishi → E-commerce yoki SaaS
- 10+ kishi → Enterprise

**2. Loyiha turi?**
- MVP/Prototype → Startup MVP
- Online do'kon → E-commerce
- SaaS xizmat → SaaS
- Katta tizim → Enterprise

**3. Tezlik vs Sifat?**
- Tezlik muhim → Startup MVP
- Balans → E-commerce/SaaS
- Sifat muhim → Enterprise

---

## 🚀 Qanday Ishlatish?

### 1. Preset Tanlash

```bash
# Startup MVP
cp .kiro/presets/startup-mvp.yaml .kiro/active-preset.yaml

# E-commerce
cp .kiro/presets/ecommerce.yaml .kiro/active-preset.yaml

# SaaS
cp .kiro/presets/saas.yaml .kiro/active-preset.yaml

# Enterprise
cp .kiro/presets/enterprise.yaml .kiro/active-preset.yaml
```

### 2. Faqat Kerakli Agentlarni Chaqirish

```bash
# Yomon ❌ - Barcha agentlarni yuklash
@code-reviewer
@security-auditor
@performance-optimizer
# ... 55 ta agent

# Yaxshi ✅ - Faqat kerakli agentni chaqirish
@code-reviewer src/app.js ni ko'rib chiq
```

---

## ⚡ Performance Optimization

### 1. Lazy Loading

Agentlar **faqat chaqirilganda** yuklanadi:

```bash
# Agent yuklanmaydi
# ...

# Agent chaqirilganda yuklanadi
@code-reviewer Review qil  # ← Shu yerda yuklanadi
```

### 2. Hook Optimization

Faqat kerakli hooklarni yoqing:

```yaml
# Minimal (Tez)
active_hooks:
  - auto-code-review
  - auto-security-scan
  - pre-deployment-check

# Maksimal (Sekin)
active_hooks:
  - 38 ta hook yoqilgan ❌
```

### 3. Steering File Optimization

```yaml
# Auto-include faqat 2 ta
auto_include:
  - monitoring-guidelines.md
  - code-quality-standards.md

# Qolganlari faqat kerak bo'lganda yuklanadi
```

---

## 📊 Performance Comparison

### Startup MVP (12 agent)
```
Kiro startup vaqti:    ~2 sekund   ⚡⚡⚡⚡⚡
Agent chaqirish:       ~0.5 sekund ⚡⚡⚡⚡⚡
Memory usage:          ~200MB      ⚡⚡⚡⚡⚡
```

### SaaS (24 agent)
```
Kiro startup vaqti:    ~3 sekund   ⚡⚡⚡⚡
Agent chaqirish:       ~0.8 sekund ⚡⚡⚡⚡
Memory usage:          ~350MB      ⚡⚡⚡⚡
```

### Enterprise (55 agent)
```
Kiro startup vaqti:    ~5 sekund   ⚡⚡⚡
Agent chaqirish:       ~1.2 sekund ⚡⚡⚡
Memory usage:          ~500MB      ⚡⚡⚡
```

---

## 💡 Best Practices

### 1. Kichikdan Boshlang

```bash
# 1. MVP bilan boshlang
Use: startup-mvp.yaml

# 2. Kerak bo'lganda kengaytiring
Add: seo-optimizer
Add: monitoring-setup-specialist

# 3. Oxirida to'liq tizimga o'ting
Use: enterprise.yaml
```

### 2. Faqat Kerakli Agentlarni Yoqing

```yaml
# Yomon ❌
agents:
  - all 55 agents enabled

# Yaxshi ✅
agents:
  - code-reviewer
  - security-auditor
  - performance-optimizer
  # Faqat kerakli agentlar
```

### 3. Hooklarni Ehtiyotkorlik Bilan Yoqing

```yaml
# Yomon ❌ - Har bir file save da 10 ta hook
hooks:
  - auto-code-review
  - auto-security-scan
  - performance-check
  - test-coverage-check
  - database-review
  - dependency-check
  - documentation-reminder
  - api-review
  - error-handling-check
  - seo-check

# Yaxshi ✅ - Faqat muhim hooklar
hooks:
  - auto-code-review
  - auto-security-scan
  - pre-deployment-check
```

---

## 🎯 Tavsiyalar

### Startup (1-3 oy)
```
Preset: Startup MVP
Agents: 12 ta
Hooks: 3 ta
Focus: Tezlik
```

### Growth (3-12 oy)
```
Preset: SaaS yoki E-commerce
Agents: 18-24 ta
Hooks: 8 ta
Focus: Balans
```

### Scale (12+ oy)
```
Preset: Enterprise
Agents: 55 ta
Hooks: 12 ta
Focus: Sifat
```

---

## ⚠️ Xavotir Olmang!

### Agentlar Lazy Load Qilinadi

```
55 ta agent mavjud ≠ 55 ta agent yuklanadi

Faqat chaqirilgan agentlar yuklanadi!
```

### Misol:

```bash
# Faqat 1 ta agent yuklanadi
@code-reviewer Review qil

# Faqat 2 ta agent yuklanadi
@code-reviewer Review qil
@security-auditor Xavfsizlik tekshir

# Faqat 3 ta agent yuklanadi
@code-reviewer Review qil
@security-auditor Xavfsizlik tekshir
@performance-optimizer Performance check
```

---

## 🎊 Xulosa

### ✅ Optimizatsiya Qilingan

1. **Preset tizimi** - Faqat kerakli agentlar
2. **Lazy loading** - Faqat chaqirilganda yuklanadi
3. **Hook optimization** - Faqat kerakli hooklar
4. **Steering optimization** - Faqat kerakli fayllar

### ✅ Tezlik

- Startup MVP: Juda tez ⚡⚡⚡⚡⚡
- SaaS/E-commerce: Tez ⚡⚡⚡⚡
- Enterprise: Yaxshi ⚡⚡⚡

### ✅ Moslashuvchanlik

- Kichikdan boshlang
- Kerak bo'lganda kengaytiring
- Har doim optimallashtirilgan

---

**Xulosa: 55 ta agent bor, lekin siz faqat keraklilarini ishlatilng! 🚀**
