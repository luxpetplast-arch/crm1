---
inclusion: fileMatch
fileMatchPattern: "**/components/**,**/pages/**,**/app/**"
---

# Frontend Performance Guidelines

## Bundle Optimization

- Keep main bundle < 200KB
- Code splitting by route
- Lazy load heavy components
- Tree shaking enabled
- Remove unused dependencies

## Loading Performance

```typescript
// Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Dynamic imports
const module = await import('./module');

// Preload critical resources
<link rel="preload" href="/critical.css" as="style" />
```

## Image Optimization

- Use WebP format with fallback
- Lazy load images below fold
- Responsive images with srcset
- Compress images (80-85% quality)
- Use CDN for images

## Core Web Vitals Targets

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- TTFB (Time to First Byte): < 600ms

## Caching Strategy

- Cache static assets for 1 year
- Use service worker for offline support
- Version assets for cache invalidation
- Cache API responses appropriately
