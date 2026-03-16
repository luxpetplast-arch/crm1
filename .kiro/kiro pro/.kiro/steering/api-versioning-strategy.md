---
inclusion: fileMatch
fileMatchPattern: "**/routes/**,**/api/**,**/controllers/**"
---

# API Versioning Strategy

## Versioning Approach

Use URL versioning for clarity:
```
/api/v1/users
/api/v2/users
```

## Breaking Changes

Only introduce breaking changes in major versions:

### Breaking Changes Include:
- Removing endpoints
- Renaming fields
- Changing data types
- Changing authentication
- Changing response structure

### Non-Breaking Changes:
- Adding new endpoints
- Adding optional fields
- Adding new response fields
- Deprecating (not removing) fields

## Deprecation Process

1. **Announce**: 6 months before removal
2. **Warn**: Add deprecation headers
3. **Document**: Update docs with migration guide
4. **Monitor**: Track usage of deprecated endpoints
5. **Remove**: After sunset date

## Version Headers

```typescript
// Deprecation warning
res.setHeader('Deprecation', 'true');
res.setHeader('Sunset', 'Sat, 01 Jun 2024 00:00:00 GMT');
res.setHeader('Link', '<https://api.example.com/v2/users>; rel="successor-version"');
```

## Migration Guide Template

```markdown
# Migration Guide: v1 → v2

## Breaking Changes
- Authentication changed from session to JWT
- User field `name` renamed to `fullName`

## Migration Steps
1. Update authentication
2. Update field names
3. Test thoroughly

## Timeline
- Deprecation: 2024-01-01
- Sunset: 2024-06-01
```

## Best Practices

- Support N-1 versions (current + previous)
- Minimum 6 months deprecation period
- Clear migration guides
- Monitor version usage
- Communicate changes early
