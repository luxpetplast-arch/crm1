# Feature Management System

Loyiha funksiyalarini xavfsiz boshqarish tizimi.

## Maqsad

- ✅ Eski funksiyalar yangi funksiyalar qo'shilganda ishdan chiqmasligi
- ✅ Funksiyalar bir-biriga to'sqinlik qilmasligi
- ✅ Funksiya dependencylarini kuzatish
- ✅ Backward compatibility ta'minlash
- ✅ Xavfsiz migration

## Fayllar

- `registry.yaml` - Barcha funksiyalar ro'yxati
- `README.md` - Bu fayl
- `migrations/` - Migration guide'lar

## Yangi Funksiya Qo'shish

### 1. Feature Manager Agent Ishlatish

```
@feature-manager Yangi funksiya qo'shmoqchiman: [tavsif]
```

Agent quyidagilarni tekshiradi:
- Conflict bor-yo'qligini
- Dependencylar mavjudligini
- Endpoint konfliktlarini
- Backward compatibility

### 2. Registry Yangilash

```yaml
features:
  yangi-funksiya:
    status: active
    version: "1.0.0"
    added: "2024-01-15"
    description: "Funksiya tavsifi"
    dependencies:
      - boshqa-funksiya
    conflicts: []
    endpoints:
      - POST /api/new-feature
```

### 3. Testlar Yozish

Yangi funksiya uchun testlar yozing va eski testlar o'tishini tekshiring.

### 4. Dokumentatsiya

Funksiya dokumentatsiyasini yozing.

## Funksiyani Yangilash

### Breaking Changes Bilan

1. Yangi versiya yarating
2. Migration guide yozing
3. Deprecation warning qo'shing
4. Eski versiyani deprecated qiling
5. Removal date belgilang (minimum 3 oy)

```yaml
features:
  funksiya:
    status: active
    version: "2.0.0"
    breaking_changes:
      - version: "2.0.0"
        date: "2024-01-15"
        description: "API format o'zgartirildi"
        migration: "docs/migration-v2.md"
```

### Breaking Changes Bo'lmasa

Faqat version raqamini oshiring:

```yaml
features:
  funksiya:
    version: "1.1.0"
    updated: "2024-01-15"
```

## Funksiyani O'chirish

### 1. Deprecate Qilish

```yaml
features:
  eski-funksiya:
    status: deprecated
    deprecated: "2024-01-15"
    removal_date: "2024-06-01"
    replacement: "yangi-funksiya v1.0.0"
    migration_guide: "docs/migrate-to-new.md"
```

### 2. Warning Qo'shish

Kodga deprecation warning qo'shing:

```typescript
function eskiFunksiya() {
  console.warn(
    'DEPRECATED: eskiFunksiya() is deprecated. ' +
    'Use yangiFunksiya() instead. ' +
    'Will be removed on 2024-06-01'
  );
  // ...
}
```

### 3. Migration Guide Yozish

`migrations/eski-to-yangi.md` faylida batafsil ko'rsatma bering.

### 4. O'chirish

Removal date kelganda:
1. Funksiyani o'chiring
2. Registry'dan o'chiring
3. Changelog'ga qo'shing

## Conflict Prevention

### Endpoint Conflicts

```yaml
features:
  funksiya-1:
    endpoints:
      - POST /api/users
  
  funksiya-2:
    endpoints:
      - POST /api/users  # ❌ CONFLICT!
```

Feature Manager buni aniqlaydi va xato beradi.

### Dependency Conflicts

```yaml
features:
  funksiya-a:
    dependencies:
      - funksiya-b v1.x
  
  funksiya-b:
    version: "2.0.0"  # ❌ INCOMPATIBLE!
```

### Resource Conflicts

```yaml
features:
  funksiya-1:
    conflicts:
      - funksiya-2  # Bu ikkalasi bir vaqtda ishlamaydi
```

## Feature Flags

Yangi funksiyani bosqichma-bosqich chiqarish:

```yaml
feature_flags:
  yangi-funksiya:
    enabled: true
    rollout_percentage: 50  # 50% foydalanuvchilarga
    environments:
      - staging
      - production
    users:
      - beta-testers
```

Kodda:

```typescript
if (featureFlags.isEnabled('yangi-funksiya', { userId: user.id })) {
  // Yangi funksiya
} else {
  // Eski funksiya
}
```

## Compatibility Matrix

Qaysi versiyalar bir-biri bilan ishlashini ko'rsatadi:

```yaml
compatibility:
  funksiya-a:
    v1.x: supports [funksiya-b v1.0-1.5]
    v2.x: supports [funksiya-b v2.0+]
```

## Best Practices

1. ✅ Har doim registry'ni yangilang
2. ✅ Breaking changes uchun migration guide yozing
3. ✅ Deprecation timeline belgilang (min 3 oy)
4. ✅ Feature flags ishlatib bosqichma-bosqich chiqaring
5. ✅ Testlar yozing
6. ✅ Dokumentatsiya yozing
7. ✅ Changelog'ni yangilang
8. ✅ Team'ga xabar bering

## Yordam

Agar savollar bo'lsa:

```
@feature-manager yordam
@feature-manager conflict tekshir
@feature-manager compatibility report
```

Feature Manager agent sizga yordam beradi!
