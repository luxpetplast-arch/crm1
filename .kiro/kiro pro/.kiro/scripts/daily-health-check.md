# Daily Health Check Script

Run this every morning to check project health.

## Usage

```bash
@project-supervisor Daily health check o'tkazish
```

## Checks

### 1. Code Quality
```bash
@code-quality-enforcer Quality metrics tekshir
- Test coverage
- Code complexity
- Technical debt
- Code smells
```

### 2. Security
```bash
@security-auditor Security scan
- Vulnerabilities
- Dependency issues
- Secret leaks
```

### 3. Performance
```bash
@performance-optimizer Performance check
- Response times
- Database queries
- Memory usage
```

### 4. Dependencies
```bash
@dependency-manager Dependency check
- Outdated packages
- Security vulnerabilities
- Breaking changes
```

### 5. Tests
```bash
@regression-tester Test suite run
- All tests passing
- No flaky tests
- Coverage maintained
```

### 6. Monitoring
```bash
@monitoring-setup-specialist Monitoring check
- All services up
- No critical alerts
- Metrics normal
```

## Report Format

```markdown
# Daily Health Check Report - 2024-01-15

## Overall Status: ✅ HEALTHY

### Code Quality: ✅
- Coverage: 87% (target: 80%)
- Complexity: 6.2 avg (target: <10)
- Technical Debt: 32h (target: <40h)

### Security: ✅
- Vulnerabilities: 0
- Outdated deps: 3 (low priority)

### Performance: ✅
- Response time: 245ms (target: <500ms)
- Database: Healthy

### Tests: ✅
- All 1,247 tests passing
- Coverage: 87%

### Monitoring: ✅
- All services up
- No critical alerts

## Action Items
- Update 3 low-priority dependencies
- Refactor 2 complex functions
```

## Automation

Add to cron or GitHub Actions:

```yaml
# .github/workflows/daily-health-check.yml
name: Daily Health Check
on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM daily
```
