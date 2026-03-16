# Bug Fix Workflow

## 1. Investigation

```bash
# Step 1: Analyze bug
@log-analyzer Loglarni tahlil qil
@error-handler Error stackni ko'rib chiq

# Step 2: Reproduce
@integration-tester Bug ni reproduce qil
```

## 2. Fix

```bash
# Step 3: Write fix
@code-reviewer Fix ni yoz va review qil
@security-auditor Xavfsizlik tekshir
```

## 3. Testing

```bash
# Step 4: Test fix
@unit-test-generator Test yoz
@regression-tester Regression test
```

## 4. Deploy

```bash
# Step 5: Deploy fix
@ci-cd-specialist Deploy qil
@monitoring-setup-specialist Monitor qil
```

## Checklist

- [ ] Bug reproduced
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Tests added
- [ ] Regression tests passed
- [ ] Code reviewed
- [ ] Deployed
- [ ] Verified in production
