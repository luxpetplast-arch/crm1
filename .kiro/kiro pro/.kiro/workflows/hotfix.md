# Hotfix Workflow (Critical Production Issues)

## ⚠️ Emergency Response

```bash
# Step 1: Assess severity
@project-supervisor Critical issue ni baholash
@alert-manager Incident yaratish

# Step 2: Quick investigation
@log-analyzer Production loglarni tekshir
@metrics-collector Metricsni tahlil qil

# Step 3: Immediate fix
@code-reviewer Tez fix yozish
@security-auditor Xavfsizlik tekshir (fast track)

# Step 4: Fast testing
@integration-tester Critical path test
@regression-tester Key features test

# Step 5: Emergency deploy
@ci-cd-specialist Production ga deploy
@monitoring-setup-specialist Monitor qil

# Step 6: Verify
@project-supervisor Production da verify qil
```

## Post-Hotfix

```bash
# Step 7: Post-mortem
@project-supervisor Incident report yoz
@progress-tracker Lessons learned
```

## Checklist

- [ ] Severity assessed (P0/P1)
- [ ] Stakeholders notified
- [ ] Fix implemented
- [ ] Critical tests passed
- [ ] Deployed to production
- [ ] Verified working
- [ ] Monitoring active
- [ ] Post-mortem completed
- [ ] Preventive measures planned
