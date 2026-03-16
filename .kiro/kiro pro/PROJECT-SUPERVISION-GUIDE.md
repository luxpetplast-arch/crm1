# 🎯 PROJECT SUPERVISION GUIDE

## Loyihani Nazorat Qilish va Boshqarish

Bu qo'llanma loyihani qanday nazorat qilish va AI agentlarni qanday boshqarish haqida.

---

## 📋 MAQSAD

Project Supervision tizimi quyidagilarni ta'minlaydi:

1. ✅ AI agentlar faqat ruxsat berilgan ishlarni qiladi
2. ✅ Barcha o'zgarishlar user requirements ga mos
3. ✅ Scope creep oldini olinadi
4. ✅ Quality standards saqlanadi
5. ✅ Backward compatibility ta'minlanadi

---

## 🤖 ASOSIY AGENTLAR

### 1. Project Supervisor
**Fayl**: `.kiro/agents/project-supervisor.md`

**Vazifasi:**
- Barcha agentlarni nazorat qiladi
- Requirements validation
- Change approval
- Quality assurance
- Project integrity

**Qachon ishlatish:**
```bash
# Loyihani boshqarish
@project-supervisor Loyihani nazorat qil

# Requirements validation
@project-supervisor Requirements tekshir

# Change approval
@project-supervisor O'zgarishlarni tasdiqlash
```

### 2. Progress Tracker
**Fayl**: `.kiro/agents/progress-tracker.md`

**Vazifasi:**
- Progress kuzatish
- Checklist management
- Quality validation
- Reporting

**Qachon ishlatish:**
```bash
# Progress ko'rish
@progress-tracker Hozirgi holatni ko'rsat

# Checklist yaratish
@progress-tracker Yangi feature uchun checklist

# Hisobot olish
@progress-tracker To'liq hisobot ber
```

### 3. Feature Manager
**Fayl**: `.kiro/agents/feature-manager.md`

**Vazifasi:**
- Feature tracking
- Conflict detection
- Dependency management
- Backward compatibility

**Qachon ishlatish:**
```bash
# Yangi feature qo'shish
@feature-manager Yangi feature qo'shmoqchiman

# Conflict tekshirish
@feature-manager Conflictlar bormi?

# Feature registry ko'rish
@feature-manager Barcha featurelarni ko'rsat
```

---

## 📊 SUPERVISION CONFIG

**Fayl**: `.kiro/supervision/config.yaml`

### Supervision Modes

```yaml
supervision_mode: strict  # strict | moderate | permissive
```

**Strict Mode** (Tavsiya etiladi):
- Har bir o'zgarish tasdiqlanadi
- Breaking changes bloklangan
- Quality gates majburiy

**Moderate Mode**:
- Minor o'zgarishlar avtomatik
- Major o'zgarishlar tasdiqlanadi

**Permissive Mode**:
- Ko'p o'zgarishlar avtomatik
- Faqat critical o'zgarishlar tasdiqlanadi

### Auto-Approve

```yaml
auto_approve:
  - minor_bug_fixes
  - typo_corrections
  - documentation_updates
  - test_additions
  - code_formatting
```

### Require Approval

```yaml
require_approval:
  - api_endpoint_changes
  - database_schema_changes
  - breaking_changes
  - new_feature_additions
  - dependency_updates
  - configuration_changes
```

### Protected Files

```yaml
protected_files:
  - .kiro/features/registry.yaml
  - .kiro/supervision/config.yaml
  - package.json
  - database/schema.prisma
  - .env.production
```

---

## 🔄 WORKFLOW

### Yangi Feature Qo'shish

```
1. User Request
   "Yangi user profile feature kerak"
   ↓
2. Project Supervisor
   - Requirements parse qiladi
   - Scope belgilaydi
   - Approach tasdiqlaydi
   ↓
3. Feature Manager
   - Conflict tekshiradi
   - Dependency tekshiradi
   - Registry ga qo'shadi
   ↓
4. Implementation
   - Code Generator: Boilerplate
   - Database Optimizer: Schema
   - API Designer: Endpoints
   ↓
5. Validation (Har bir qadamda)
   - Code Reviewer: Code quality
   - Security Auditor: Security
   - Test Coverage: Tests
   ↓
6. Progress Tracker
   - Checklist validation
   - Quality metrics
   - Completion report
   ↓
7. Pre-Deployment
   - Regression tests
   - Integration tests
   - Performance check
   ↓
8. Deployment
   - Staging first
   - Smoke tests
   - Production
```

### Agent Intervention

```
Agent proposes change
   ↓
Project Supervisor reviews
   ↓
   ├─ APPROVE → Execute
   ├─ REJECT → Stop and explain
   ├─ MODIFY → Request changes
   └─ CLARIFY → Ask user
```

---

## 🚨 INTERVENTION SCENARIOS

### Scenario 1: Scope Creep

```
User: "User profile feature qo'sh"

Agent: "User profile + social media links + activity feed qo'shyapman"

Project Supervisor: ❌ STOP!
- Social media links requested emas
- Activity feed requested emas
- Faqat user profile qo'shilishi kerak

Action: Agent to'xtatildi, scope ga qaytarildi
```

### Scenario 2: Breaking Change

```
Agent: "API endpoint /api/users ni /api/v2/users ga o'zgartiraman"

Project Supervisor: ⚠️ WARNING!
- Bu breaking change
- Eski clientlar ishlamay qoladi
- User approval kerak

Action: User ga escalate qilindi
```

### Scenario 3: Unauthorized File

```
Agent: "package.json ni yangilayapman"

Project Supervisor: ❌ BLOCKED!
- package.json protected file
- Maxsus ruxsat kerak
- User approval talab qilinadi

Action: O'zgarish bloklandi
```

---

## 📋 CHECKLISTS

### Feature Development Checklist

**Planning (3 items)**
- [ ] Requirements documented
- [ ] Design approved
- [ ] Technical approach defined

**Implementation (4 items)**
- [ ] Database schema updated
- [ ] API endpoints created
- [ ] Frontend components created
- [ ] Error handling implemented

**Testing (3 items)**
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Regression tests passed

**Quality (3 items)**
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Performance validated

**Documentation (3 items)**
- [ ] API documentation updated
- [ ] User guide created
- [ ] Changelog updated

**Deployment (5 items)**
- [ ] Feature registry updated
- [ ] Pre-deployment check passed
- [ ] Deployed to staging
- [ ] User acceptance testing
- [ ] Deployed to production

**Total: 21 items**

---

## 📊 QUALITY GATES

### Test Coverage
```yaml
min_test_coverage: 80%
current: 0%
status: pending
```

### Code Quality
```yaml
minimum_score: 8.0/10
current: 0
status: pending
```

### Security
```yaml
vulnerabilities_allowed: 0
current: 0
status: pending
```

### Performance
```yaml
max_response_time_ms: 500
current: 0
status: pending
```

### Documentation
```yaml
completeness: 100%
current: 0%
status: pending
```

---

## 🎯 AGENT LIMITS

```yaml
agent_limits:
  max_changes_per_session: 10
  max_files_modified: 20
  max_lines_changed: 500
  require_confirmation_after: 5
  timeout_minutes: 30
```

Agar agent bu limitlardan oshsa:
- ⚠️ Warning beriladi
- 🛑 To'xtatiladi
- 👤 User ga escalate qilinadi

---

## 📈 MONITORING

### Track Qilinadigan Narsalar

```yaml
monitoring:
  track:
    - agent_activities
    - file_modifications
    - test_results
    - performance_metrics
    - security_scans
    - user_feedback
```

### Reporting

```yaml
reporting:
  real_time_alerts: true
  summary_after_session: true
  daily_digest: false
  weekly_report: false
```

---

## 🚀 BEST PRACTICES

### 1. Clear Requirements
```
❌ BAD: "User profile kerak"

✅ GOOD: "User profile feature:
- Bio field (max 500 chars)
- Avatar upload (max 2MB, jpg/png)
- Profile edit form
- Public profile view"
```

### 2. Incremental Development
```
✅ Step 1: Database schema
✅ Step 2: API endpoints
✅ Step 3: Frontend components
✅ Step 4: Tests
✅ Step 5: Documentation
```

### 3. Continuous Validation
```
After each step:
- ✅ Tests pass
- ✅ Code review
- ✅ Security check
- ✅ Progress update
```

### 4. Regular Communication
```
- Daily: Progress updates
- Weekly: Sprint review
- Monthly: Retrospective
```

---

## 🆘 TROUBLESHOOTING

### Agent Stuck?

```bash
# Check progress
@progress-tracker Hozirgi holat?

# Check blockers
@progress-tracker Blockerlar bormi?

# Restart agent
@project-supervisor Agent ni restart qil
```

### Agent Going Off-Track?

```bash
# Stop agent
@project-supervisor Agent ni to'xtat

# Review changes
@project-supervisor O'zgarishlarni ko'rib chiq

# Rollback if needed
@project-supervisor Rollback qil
```

### Quality Gate Failed?

```bash
# Check which gate failed
@progress-tracker Quality gates status

# Fix issues
@code-reviewer Issues ni fix qil
@security-auditor Vulnerabilities fix qil

# Re-run checks
@progress-tracker Quality gates qayta tekshir
```

---

## 📞 ESCALATION

### When to Escalate to User

1. **Breaking Changes**
   ```
   @project-supervisor Breaking change detected!
   User approval required.
   ```

2. **Scope Deviation**
   ```
   @project-supervisor Scope deviation detected!
   Clarification needed.
   ```

3. **Critical Issues**
   ```
   @project-supervisor Critical issue found!
   Immediate attention required.
   ```

4. **Blockers**
   ```
   @progress-tracker Blocker detected!
   Cannot proceed without user input.
   ```

---

## 📚 EXAMPLE SESSIONS

### Session 1: Successful Feature

```
User: "User profile feature qo'sh"

@project-supervisor Requirements tekshir
✅ Requirements clear
✅ Scope defined
✅ Approach approved

@feature-manager Conflict tekshir
✅ No conflicts
✅ Dependencies OK
✅ Registry updated

Implementation...
✅ Database schema
✅ API endpoints
✅ Frontend components

@progress-tracker Status?
✅ 15/21 items complete
✅ 71% progress
⏳ 6 items remaining

Testing...
✅ Unit tests pass
✅ Integration tests pass
✅ Regression tests pass

@project-supervisor Final check
✅ All requirements met
✅ Quality gates passed
✅ Ready for deployment

Result: ✅ SUCCESS
```

### Session 2: Intervention Required

```
User: "Login feature qo'sh"

Agent: "Login + registration + password reset + 
        email verification + 2FA qo'shyapman"

@project-supervisor ❌ STOP!
Scope creep detected!

User requested: Login only
Agent adding: 5 features

Action: Agent stopped
Scope: Reduced to login only

Implementation...
✅ Login feature only

Result: ✅ SUCCESS (with intervention)
```

---

## 🎉 SUMMARY

**Project Supervision tizimi:**

✅ Agentlarni nazorat qiladi
✅ Requirements ga rioya qiladi
✅ Quality ni ta'minlaydi
✅ Scope ni saqlaydi
✅ Progress ni kuzatadi

**Asosiy Agentlar:**
- Project Supervisor (nazorat)
- Progress Tracker (kuzatuv)
- Feature Manager (boshqaruv)

**Asosiy Fayllar:**
- `.kiro/supervision/config.yaml`
- `.kiro/features/registry.yaml`
- `.kiro/checklists/feature-template.yaml`

**Ishlatish:**
```bash
@project-supervisor Loyihani boshqar
@progress-tracker Progress ko'rsat
@feature-manager Featurelarni boshqar
```

---

*Xavfsiz va nazorat ostida development!* 🚀
