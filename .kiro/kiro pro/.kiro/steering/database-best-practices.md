---
inclusion: fileMatch
fileMatchPattern: "**/migrations/**,**/models/**,**/schema/**"
---

# Database Best Practices

## Migration Guidelines

1. **Always Reversible**: Har bir migration uchun rollback script yozing
2. **Small Steps**: Katta o'zgarishlarni kichik qadamlarga bo'ling
3. **Test First**: Staging da test qiling
4. **Backup**: Migration oldidan backup oling
5. **Zero Downtime**: Backward compatible o'zgarishlar qiling

## Schema Design

- Proper indexing for query performance
- Foreign key constraints for data integrity
- Appropriate data types
- Normalization vs denormalization trade-offs
- Partitioning for large tables

## Query Optimization

- Avoid N+1 queries
- Use proper indexes
- Limit result sets
- Use connection pooling
- Monitor slow queries

## Security

- Parameterized queries (prevent SQL injection)
- Least privilege principle
- Encrypt sensitive data
- Audit logging
- Regular security audits
