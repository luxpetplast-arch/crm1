---
inclusion: auto
---

# Project Workflow - Loyiha Ish Jarayoni

## Development Workflow

### 1. Feature Development
```
1. Branch yaratish: git checkout -b feature/feature-name
2. Kod yozish
3. Auto hooks ishlaydi (code review, security scan)
4. Testlar yozish
5. Local test: npm test
6. Commit: git commit -m "feat: description"
7. Push: git push origin feature/feature-name
8. Pull Request yaratish
```

### 2. Bug Fix Workflow
```
1. Branch: git checkout -b fix/bug-description
2. Bug reproduce qilish
3. Test yozish (bug uchun)
4. Bug fix
5. Test o'tishini tekshirish
6. Commit va push
```

### 3. Code Review Process
```
1. PR yaratilganda:
   - @code-reviewer avtomatik ishlaydi
   - Security scan avtomatik
   - CI/CD pipeline ishga tushadi

2. Reviewer tekshiradi:
   - Kod sifati
   - Testlar
   - Dokumentatsiya

3. Approval keyin merge
```

## Kiro Bilan Ishlash

### Har Kuni
```
1. Loyihani ochish
2. Hooks faol ekanligini tekshirish
3. Kod yozish
4. Agentlar avtomatik ishlaydi
```

### Commit Qilishdan Oldin
```
1. Performance check ishga tushirish
2. Git commit helper ishlatish
3. Barcha testlar o'tishini tekshirish
```

### Deploy Qilishdan Oldin
```
1. Full security audit
2. Performance analysis
3. Code review
4. Test coverage tekshiruvi
```

## Kiro Agentlaridan Foydalanish

### Code Review
```
# Fayl yozganingizda avtomatik
# Yoki qo'lda:
@code-reviewer src/auth.js ni ko'rib chiq
```

### Security Audit
```
# Kod yozganingizda avtomatik
# Yoki qo'lda:
@security-auditor API endpointlarni tekshir
```

### Performance Check
```
# Qo'lda ishga tushirish
Command Palette → Trigger Hook → Performance Check
```

## Hooks Management

### Kerakli Hooklar (Yoqilgan)
- ✅ `review-code-changes.json` - Agent ish tugatgach review
- ✅ `security-check-before-write.json` - Yozishdan oldin tekshirish

### Optional Hooklar (Kerak bo'lganda yoqish)
- 📦 `auto-code-review.json` - Har safar kod yozganingizda (sekin bo'lishi mumkin)
- 📦 `auto-security-scan.json` - Har safar kod yozganingizda (sekin bo'lishi mumkin)
- 📦 `lint-on-save.json` - Lint kerak bo'lsa
- 📦 `auto-format-on-save.json` - Formatter kerak bo'lsa

### Hook Yoqish/O'chirish
```json
// .kiro/hooks/hook-name.json
{
  "disabled": true  // O'chirish uchun
}
```

## Troubleshooting

### Hook Ishlamayapti
1. Explorer → Agent Hooks → Hook mavjudligini tekshiring
2. JSON syntax to'g'riligini tekshiring
3. Kiro'ni restart qiling

### Agent Javob Bermayapti
1. `.kiro/agents/` da agent fayli borligini tekshiring
2. Agent nomini to'g'ri yozganingizni tekshiring
3. `@agent-name` format ishlatganingizni tekshiring

### Performance Sekin
1. Barcha auto hooklar yoqilgan bo'lsa, ba'zilarini o'chiring
2. Faqat kerakli agentlarni ishlatib turing
3. Katta fayllar uchun selective review so'rang

## Best Practices

### ✅ Do
- Har kuni hooklar ishlayotganini tekshiring
- Agent takliflarini o'qib chiqing
- Security ogohlantirishlarni jiddiy qabul qiling
- Performance bottlenecks ni tuzating
- Testlar yozing

### ❌ Don't
- Barcha hooklarni bir vaqtda yoqmang
- Agent takliflarini ignore qilmang
- Hardcoded secrets qoldirmang
- Security vulnerabilities ni ignore qilmang
- Testsiz kod commit qilmang

## Yordam

Agar muammo bo'lsa:
```
Kiro bilan gaplashing:
- "Hooklar ishlamayapti"
- "Agent qanday ishlatiladi?"
- "Performance yaxshilash kerak"
```

Men har doim yordam beraman! 🚀
