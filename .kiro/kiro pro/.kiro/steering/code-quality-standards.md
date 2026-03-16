---
inclusion: auto
---

# Code Quality Standards

## Quality Gates

All code must meet these standards:

```yaml
quality_requirements:
  test_coverage: ≥ 80%
  cyclomatic_complexity: ≤ 10
  function_length: ≤ 50 lines
  duplication: ≤ 3%
  maintainability_index: ≥ 65
  security_vulnerabilities: 0
```

## Code Complexity

### Cyclomatic Complexity
- Simple: 1-5 (good)
- Moderate: 6-10 (acceptable)
- Complex: 11-20 (refactor recommended)
- Very Complex: 21+ (must refactor)

### Cognitive Complexity
Keep cognitive complexity low:
- Avoid deep nesting (max 3 levels)
- Extract complex conditions
- Use early returns
- Break down large functions

## Code Smells to Avoid

1. **Long Methods**: > 50 lines
2. **Large Classes**: > 300 lines
3. **Long Parameter Lists**: > 4 parameters
4. **Duplicate Code**: Copy-paste code
5. **Dead Code**: Unused code
6. **Magic Numbers**: Unexplained constants
7. **God Objects**: Classes that do too much

## Refactoring Triggers

Refactor when you see:
- Difficulty understanding code
- Difficulty adding features
- Frequent bugs in same area
- High complexity metrics
- Code duplication
- Poor test coverage

## Technical Debt

Track and manage technical debt:

```yaml
# .kiro/technical-debt.yaml
debt_items:
  - id: TD-001
    title: "Refactor authentication"
    severity: high
    estimated_hours: 16
    priority: 1
```

## Pre-commit Checks

Run these before every commit:
- Linting (ESLint/Pylint)
- Formatting (Prettier/Black)
- Type checking
- Unit tests
- Complexity check

## Code Review Checklist

- [ ] Code is readable and maintainable
- [ ] Tests are included
- [ ] No code smells
- [ ] Complexity is acceptable
- [ ] Documentation is updated
- [ ] No security issues
- [ ] Performance is acceptable
