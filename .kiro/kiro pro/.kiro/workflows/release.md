# Release Workflow

## 1. Pre-release

```bash
# Step 1: Release planning
@release-manager Release rejasini yarat
@sprint-planner Sprint ni yopish

# Step 2: Code freeze
@project-supervisor Code freeze e'lon qilish
@feature-manager Feature registry tekshir
```

## 2. Testing

```bash
# Step 3: Full testing
@regression-tester Full regression test
@integration-tester Integration test
@e2e-tester E2E test
@performance-optimizer Performance test
@security-auditor Security audit
```

## 3. Documentation

```bash
# Step 4: Release docs
@documentation-writer Release notes yoz
@documentation-writer Changelog yangilash
@api-versioning-manager API version docs
```

## 4. Deployment

```bash
# Step 5: Staging deployment
@ci-cd-specialist Staging ga deploy
@database-migration-manager Database migrate

# Step 6: Staging validation
@project-supervisor Staging da test
# User acceptance testing

# Step 7: Production deployment
@backup-manager Backup olib qo'yish
@ci-cd-specialist Production ga deploy
@database-migration-manager Production migrate
```

## 5. Post-release

```bash
# Step 8: Monitoring
@monitoring-setup-specialist Monitoring tekshir
@alert-manager Alertlarni sozlash
@log-analyzer Loglarni kuzatish

# Step 9: Verification
@project-supervisor Production health check
@metrics-collector Metricsni tekshir
```

## Checklist

- [ ] Release plan approved
- [ ] Code freeze announced
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Staging deployed
- [ ] UAT passed
- [ ] Backup created
- [ ] Production deployed
- [ ] Database migrated
- [ ] Monitoring active
- [ ] Health check passed
- [ ] Team notified
