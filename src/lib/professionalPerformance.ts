import React from 'react';

// Professional Performance Monitoring and Optimization

// Performance Metrics
export interface PerformanceMetrics {
  renderTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  errorRate: number;
  userInteractions: number;
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

// Performance Thresholds
export interface PerformanceThresholds {
  maxRenderTime: number;
  maxApiResponseTime: number;
  maxMemoryUsage: number;
  minCacheHitRate: number;
  maxErrorRate: number;
  maxPageLoadTime: number;
}

// Performance Monitor Class
export class ProfessionalPerformanceMonitor {
  private static instance: ProfessionalPerformanceMonitor;
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private observers: PerformanceObserver[];
  private measurements: Map<string, number[]>;

  constructor() {
    this.metrics = {
      renderTime: 0,
      apiResponseTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      errorRate: 0,
      userInteractions: 0,
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
    };

    this.thresholds = {
      maxRenderTime: 16, // 60fps = 16ms per frame
      maxApiResponseTime: 2000, // 2 seconds
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      minCacheHitRate: 0.8, // 80%
      maxErrorRate: 0.05, // 5%
      maxPageLoadTime: 3000, // 3 seconds
    };

    this.observers = [];
    this.measurements = new Map();

    this.initializeObservers();
  }

  static getInstance(): ProfessionalPerformanceMonitor {
    if (!ProfessionalPerformanceMonitor.instance) {
      ProfessionalPerformanceMonitor.instance = new ProfessionalPerformanceMonitor();
    }
    return ProfessionalPerformanceMonitor.instance;
  }

  // Initialize performance observers
  private initializeObservers(): void {
    try {
      // Navigation timing
      this.observeNavigation();
      
      // Resource timing
      this.observeResources();
      
      // Paint timing
      this.observePaint();
      
      // Long tasks
      this.observeLongTasks();
      
      // Layout shift
      this.observeLayoutShift();
    } catch (error) {
      console.warn('Performance observers initialization failed:', error);
    }
  }

  // Observe navigation timing
  private observeNavigation(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        this.metrics.firstContentfulPaint = navigation.responseStart - navigation.fetchStart;
      }
    }
  }

  // Observe resource timing
  private observeResources(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;
            const url = resource.name;
            
            if (url.includes('/api/')) {
              this.recordMeasurement('apiResponseTime', resource.responseEnd - resource.requestStart);
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    }
  }

  // Observe paint timing
  private observePaint(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'paint') {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = entry.startTime;
            } else if (entry.name === 'largest-contentful-paint') {
              this.metrics.largestContentfulPaint = entry.startTime;
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    }
  }

  // Observe long tasks
  private observeLongTasks(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask') {
            console.warn('Long task detected:', entry.duration, 'ms');
          }
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    }
  }

  // Observe layout shift
  private observeLayoutShift(): void {
    if ('PerformanceObserver' in window) {
      let clsScore = 0;
      
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsScore += (entry as any).value;
          }
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    }
  }

  // Record measurement
  private recordMeasurement(name: string, value: number): void {
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    
    const measurements = this.measurements.get(name)!;
    measurements.push(value);
    
    // Keep only last 100 measurements
    if (measurements.length > 100) {
      measurements.shift();
    }
    
    // Update metrics
    this.updateMetrics(name, value);
  }

  // Update metrics
  private updateMetrics(name: string, value: number): void {
    switch (name) {
      case 'renderTime':
        this.metrics.renderTime = value;
        break;
      case 'apiResponseTime':
        this.metrics.apiResponseTime = this.getAverage('apiResponseTime');
        break;
      case 'memoryUsage':
        this.metrics.memoryUsage = value;
        break;
      case 'cacheHitRate':
        this.metrics.cacheHitRate = value;
        break;
      case 'errorRate':
        this.metrics.errorRate = value;
        break;
      case 'userInteractions':
        this.metrics.userInteractions++;
        break;
    }
  }

  // Get average measurement
  private getAverage(name: string): number {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    const sum = measurements.reduce((acc, val) => acc + val, 0);
    return sum / measurements.length;
  }

  // Measure render performance
  measureRenderPerformance(componentName: string, renderFn: () => void): void {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    this.recordMeasurement('renderTime', renderTime);
    
    if (renderTime > this.thresholds.maxRenderTime) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }

  // Measure API performance
  measureApiPerformance(url: string, apiCall: () => Promise<any>): Promise<any> {
    const startTime = performance.now();
    
    return apiCall().then(
      (result) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        this.recordMeasurement('apiResponseTime', responseTime);
        
        if (responseTime > this.thresholds.maxApiResponseTime) {
          console.warn(`Slow API response for ${url}: ${responseTime.toFixed(2)}ms`);
        }
        
        return result;
      },
      (error) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        this.recordMeasurement('apiResponseTime', responseTime);
        this.recordMeasurement('errorRate', this.metrics.errorRate + 0.01);
        
        console.error(`API error for ${url}:`, error);
        throw error;
      }
    );
  }

  // Measure memory usage
  measureMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize;
      
      this.recordMeasurement('memoryUsage', memoryUsage);
      
      if (memoryUsage > this.thresholds.maxMemoryUsage) {
        console.warn(`High memory usage detected: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      }
    }
  }

  // Track user interaction
  trackUserInteraction(_interactionType: string): void {
    this.recordMeasurement('userInteractions', 1);
    
    // Measure memory usage periodically
    if (this.metrics.userInteractions % 10 === 0) {
      this.measureMemoryUsage();
    }
  }

  // Track custom performance metrics
  trackPerformance(metricName: string, value: number): void {
    this.recordMeasurement(metricName, value);
    
    // Log warning if metric exceeds reasonable thresholds
    if (metricName.includes('time') && value > 5000) {
      console.warn(`High ${metricName} detected: ${value.toFixed(2)}ms`);
    }
  }

  // Get performance metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Get performance score
  getPerformanceScore(): number {
    let score = 100;
    
    // Render time (30%)
    if (this.metrics.renderTime > this.thresholds.maxRenderTime) {
      score -= 30;
    }
    
    // API response time (25%)
    if (this.metrics.apiResponseTime > this.thresholds.maxApiResponseTime) {
      score -= 25;
    }
    
    // Memory usage (20%)
    if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      score -= 20;
    }
    
    // Cache hit rate (15%)
    if (this.metrics.cacheHitRate < this.thresholds.minCacheHitRate) {
      score -= 15;
    }
    
    // Error rate (10%)
    if (this.metrics.errorRate > this.thresholds.maxErrorRate) {
      score -= 10;
    }
    
    return Math.max(0, score);
  }

  // Get performance recommendations
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.metrics.renderTime > this.thresholds.maxRenderTime) {
      recommendations.push('Render performance is slow. Consider optimizing components or using React.memo.');
    }
    
    if (this.metrics.apiResponseTime > this.thresholds.maxApiResponseTime) {
      recommendations.push('API responses are slow. Consider implementing caching or optimizing database queries.');
    }
    
    if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      recommendations.push('Memory usage is high. Consider implementing memory cleanup or reducing data retention.');
    }
    
    if (this.metrics.cacheHitRate < this.thresholds.minCacheHitRate) {
      recommendations.push('Cache hit rate is low. Consider adjusting cache TTL or implementing smarter caching strategies.');
    }
    
    if (this.metrics.errorRate > this.thresholds.maxErrorRate) {
      recommendations.push('Error rate is high. Review error logs and implement better error handling.');
    }
    
    if (this.metrics.pageLoadTime > this.thresholds.maxPageLoadTime) {
      recommendations.push('Page load time is slow. Consider lazy loading or code splitting.');
    }
    
    return recommendations;
  }

  // Generate performance report
  generateReport(): {
    score: number;
    metrics: PerformanceMetrics;
    recommendations: string[];
    timestamp: string;
  } {
    return {
      score: this.getPerformanceScore(),
      metrics: this.getMetrics(),
      recommendations: this.getRecommendations(),
      timestamp: new Date().toISOString(),
    };
  }

  // Cleanup observers
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export class PerformanceOptimizer {
  // Debounce function
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Memoize function
  static memoize<T extends (...args: any[]) => any>(
    func: T
  ): (...args: Parameters<T>) => ReturnType<T> {
    const cache = new Map();
    
    return (...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func(...args);
      cache.set(key, result);
      return result;
    };
  }

  // Lazy load component
  static lazyLoad<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
  ): React.LazyExoticComponent<T> {
    return React.lazy(importFunc);
  }

  // Preload resource
  static preloadResource(url: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    // Determine resource type
    if (url.endsWith('.js')) {
      link.as = 'script';
    } else if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  }

  // Optimize images
  static optimizeImages(): void {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach((img) => imageObserver.observe(img));
  }

  // Virtual scrolling helper
  static createVirtualScrollOptions(
    itemHeight: number,
    containerHeight: number,
    totalItems: number
  ) {
    return {
      itemHeight,
      containerHeight,
      totalItems,
      visibleItems: Math.ceil(containerHeight / itemHeight) + 2,
      scrollTop: 0,
      startIndex: 0,
      endIndex: Math.ceil(containerHeight / itemHeight) + 1,
    };
  }
}

// Create singleton instance
export const performanceMonitor = ProfessionalPerformanceMonitor.getInstance();

// Convenience functions
export const measurePerformance = (componentName: string, renderFn: () => void) => {
  performanceMonitor.measureRenderPerformance(componentName, renderFn);
};

export const measureApiCall = (url: string, apiCall: () => Promise<any>) => {
  return performanceMonitor.measureApiPerformance(url, apiCall);
};

export const trackInteraction = (interactionType: string) => {
  performanceMonitor.trackUserInteraction(interactionType);
};

export const getPerformanceReport = () => {
  return performanceMonitor.generateReport();
};

export default ProfessionalPerformanceMonitor;
