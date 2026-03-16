---
inclusion: auto
---

# Monitoring and Observability Guidelines

## Golden Signals

Monitor these 4 key metrics:

1. **Latency**: Response time (p50, p95, p99)
2. **Traffic**: Requests per second
3. **Errors**: Error rate and types
4. **Saturation**: Resource utilization

## Logging Best Practices

```typescript
// Structured logging
logger.info('User action', {
  userId: user.id,
  action: 'login',
  timestamp: new Date(),
  ip: req.ip,
  userAgent: req.headers['user-agent']
});

// Error logging with context
logger.error('Payment failed', {
  error: err.message,
  stack: err.stack,
  userId: user.id,
  amount: payment.amount,
  transactionId: payment.id
});
```

## Metrics to Track

### Application Metrics
- Request rate
- Error rate
- Response time percentiles
- Active users
- Database query time
- Cache hit rate

### Business Metrics
- User signups
- Conversions
- Revenue
- Feature usage
- User engagement

## Alerting Rules

- Alert on symptoms, not causes
- Set meaningful thresholds
- Avoid alert fatigue
- Include runbooks in alerts
- Test alert routing

## Dashboard Design

- One dashboard per service
- Focus on actionable metrics
- Use consistent time ranges
- Include SLO indicators
- Keep it simple
