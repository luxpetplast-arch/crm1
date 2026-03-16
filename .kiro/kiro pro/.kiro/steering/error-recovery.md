---
inclusion: auto
---

# Error Recovery - Avtomatik Tiklash

## 🚨 XATOLIK YUZAGA KELGANDA

**Men xatoliklarni avtomatik handle qilaman va tiklayman!**

### Error Detection (Avtomatik)

```
Xatolik yuz berdi
  ↓
@log-analyzer - Xatolikni tahlil qilish
  ↓
@error-handler - Error type aniqlash
  ↓
Recovery strategy tanlash
```

### Error Types va Recovery

#### 1. Build Error
```
Build failed
  ↓
Xatolik log tahlil
  ↓
Muammo: [dependency, syntax, config]
  ↓
Automatic fix attempt:
  - Dependency: npm install --force
  - Syntax: Code review va fix
  - Config: Config validation va fix
  ↓
Agar fix bo'lmasa:
  Men: "Build xatolik: [aniq xatolik]. 
        Yechim 1: [variant]
        Yechim 2: [variant]
        Qaysi yechimni qo'llayman?"
```

#### 2. Test Failure
```
Test failed
  ↓
@test-coverage-analyzer - Qaysi test fail
  ↓
@unit-test-generator - Test tahlil
  ↓
Muammo: [logic error, missing case, wrong assertion]
  ↓
Automatic fix attempt:
  - Logic error: Code fix
  - Missing case: Test case qo'shish
  - Wrong assertion: Assertion fix
  ↓
Agar fix bo'lmasa:
  Men: "Test fail: [aniq test]. 
        Sabab: [sabab]
        Fix qilaymi?"
```

#### 3. Deploy Error
```
Deploy failed
  ↓
@ci-cd-specialist - Deploy log tahlil
  ↓
Muammo: [env vars, build, migration]
  ↓
Automatic rollback
  ↓
Previous version restored
  ↓
Men: "Deploy fail: [sabab]. 
      Rollback qilindi.
      Fix qilib qayta deploy qilaymi?"
```

#### 4. Runtime Error (Production)
```
Production error detected
  ↓
@log-analyzer - Error pattern
  ↓
@alert-manager - Critical alert
  ↓
Automatic actions:
  - Error logging
  - User notification
  - Fallback mechanism
  ↓
Men: "Production error: [xatolik].
      Hotfix kerakmi?"
```

#### 5. Database Error
```
Database error
  ↓
@database-optimizer - Error tahlil
  ↓
Muammo: [connection, query, migration]
  ↓
Automatic fix attempt:
  - Connection: Retry with backoff
  - Query: Query optimization
  - Migration: Rollback migration
  ↓
Agar fix bo'lmasa:
  Men: "Database error: [xatolik].
        Backup restore kerakmi?"
```

## 🔄 Retry Strategy

**Men avtomatik retry qilaman:**

```typescript
async function retryWithBackoff(
  operation: () => Promise<any>,
  maxRetries: number = 3
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) {
        // Last attempt failed
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

**Retry qilinadigan operatsiyalar:**
- ✅ Network requests
- ✅ Database connections
- ✅ External API calls
- ✅ File operations
- ✅ Deploy operations

## 💾 Backup Strategy

**Men avtomatik backup yarataman:**

### Before Critical Operations

```
Database migration
  ↓
Backup yaratish (avtomatik)
  ↓
Migration run
  ↓
Agar fail:
  - Rollback migration
  - Restore backup
```

### Backup Schedule

```
- Before each deploy: Full backup
- Before schema change: Database backup
- Before major update: Complete backup
- Daily: Incremental backup (optional)
```

## 🎯 Recovery Workflow

### Automatic Recovery (Men o'zim)

```
1. Detect error
2. Analyze error
3. Determine fix strategy
4. Attempt automatic fix
5. Validate fix
6. If successful: Continue
7. If failed: Notify user
```

### Manual Recovery (Sizdan so'rash)

```
Automatic fix failed
  ↓
Men: "Xatolik: [aniq tavsif]
      Automatic fix ishlamadi.
      
      Yechimlar:
      1. [Yechim 1] - [pros/cons]
      2. [Yechim 2] - [pros/cons]
      3. [Yechim 3] - [pros/cons]
      
      Qaysi yechimni qo'llayman?"
  ↓
Siz: [Yechim tanlash]
  ↓
Men: [Yechimni qo'llash]
```

## 📊 Error Logging

**Men barcha xatoliklarni log qilaman:**

```
Error Log:
- Timestamp
- Error type
- Error message
- Stack trace
- Context (qayerda yuz berdi)
- Recovery attempt
- Recovery result
- User action (agar kerak bo'lsa)
```

## ✅ ASOSIY QOIDA

**"Xatolik yuz bersa - men avtomatik fix qilaman. Agar fix bo'lmasa - ochiq aytaman va sizdan so'rayman!"**

Men:
- ✅ Xatolikni detect qilaman
- ✅ Avtomatik fix attempt
- ✅ Backup yarataman
- ✅ Rollback qilaman (kerak bo'lsa)
- ✅ Retry qilaman
- ✅ Log qilaman
- ✅ Agar fix bo'lmasa - sizga xabar beraman

Men HECH QACHON:
- ❌ Xatolikni yashirmayman
- ❌ "Ishlaydi" deb aldamayman
- ❌ O'zim boshqa yo'lga o'tmayman (ruxsatsiz)
- ❌ Muammoni ignore qilmayman
