# Weekly Report Generator

Generate comprehensive weekly progress report.

## Usage

```bash
@progress-tracker Haftalik hisobot yarat
```

## Report Sections

### 1. Progress Summary
```bash
@progress-tracker Haftalik progress
- Features completed
- Bugs fixed
- Tests added
- Documentation updated
```

### 2. Code Metrics
```bash
@code-quality-enforcer Haftalik metrics
- Lines of code added/removed
- Test coverage trend
- Complexity trend
- Technical debt trend
```

### 3. Performance
```bash
@metrics-collector Performance metrics
- Response time trend
- Error rate trend
- Uptime percentage
```

### 4. Team Activity
```bash
@sprint-planner Sprint summary
- Story points completed
- Velocity
- Sprint goals achieved
```

### 5. Quality
```bash
@code-reviewer Code review stats
- PRs merged
- Review time
- Issues found
```

## Report Template

```markdown
# Weekly Report - Week 3, 2024

## Executive Summary
- 5 features completed
- 12 bugs fixed
- 87% test coverage (+2%)
- 99.9% uptime

## Progress
### Completed
- ✅ User profile feature
- ✅ Payment integration
- ✅ Email notifications

### In Progress
- 🔄 Admin dashboard (60%)
- 🔄 Analytics (40%)

### Blocked
- ⚠️ Third-party API integration (waiting for API key)

## Metrics
- Code added: +2,450 lines
- Code removed: -890 lines
- Test coverage: 87% (+2%)
- Technical debt: 32h (-8h)

## Performance
- Avg response time: 245ms
- Error rate: 0.02%
- Uptime: 99.9%

## Team
- Velocity: 42 points
- PRs merged: 23
- Code reviews: 45

## Next Week
- Complete admin dashboard
- Start analytics feature
- Performance optimization sprint
```
