import React from 'react';
import { performanceMonitor } from './professionalPerformance';
import { errorHandler } from './professionalErrorHandler';

// Analytics Event Types
export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  USER_ACTION = 'user_action',
  API_CALL = 'api_call',
  ERROR = 'error',
  PERFORMANCE = 'performance',
  BUSINESS_EVENT = 'business_event',
  SYSTEM_EVENT = 'system_event',
}

// Analytics Event Interface
export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  name: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  properties: Record<string, any>;
  value?: number;
  category?: string;
  tags?: string[];
}

// Analytics Session
export interface AnalyticsSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  userId?: string;
  userAgent: string;
  referrer?: string;
  url: string;
  events: AnalyticsEvent[];
  duration?: number;
  pageViews: number;
  userActions: number;
  errors: number;
  performance: {
    avgPageLoadTime: number;
    avgApiResponseTime: number;
    errorRate: number;
  };
}

// Analytics Report
export interface AnalyticsReport {
  period: {
    start: Date;
    end: Date;
  };
  sessions: AnalyticsSession[];
  metrics: {
    totalSessions: number;
    totalUsers: number;
    avgSessionDuration: number;
    bounceRate: number;
    pageViews: number;
    uniquePageViews: number;
    userActions: number;
    errors: number;
    conversionRate: number;
    performance: {
      avgPageLoadTime: number;
      avgApiResponseTime: number;
      errorRate: number;
      performanceScore: number;
    };
  };
  topPages: Array<{
    url: string;
    views: number;
    uniqueViews: number;
    avgDuration: number;
  }>;
  topEvents: Array<{
    name: string;
    count: number;
    uniqueUsers: number;
    avgValue?: number;
  }>;
  userSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
}

// Professional Analytics Class
export class ProfessionalAnalytics {
  private static instance: ProfessionalAnalytics;
  private session: AnalyticsSession;
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean;
  private batchSize: number;
  private flushInterval: number;
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production';
    this.batchSize = 50;
    this.flushInterval = 30000; // 30 seconds
    
    this.session = this.createSession();
    this.startFlushTimer();
    
    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  static getInstance(): ProfessionalAnalytics {
    if (!ProfessionalAnalytics.instance) {
      ProfessionalAnalytics.instance = new ProfessionalAnalytics();
    }
    return ProfessionalAnalytics.instance;
  }

  // Create new session
  private createSession(): AnalyticsSession {
    const sessionId = this.generateSessionId();
    
    return {
      id: sessionId,
      startTime: new Date(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      url: window.location.href,
      events: [],
      pageViews: 0,
      userActions: 0,
      errors: 0,
      performance: {
        avgPageLoadTime: 0,
        avgApiResponseTime: 0,
        errorRate: 0,
      },
    };
  }

  // Generate session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate event ID
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Start flush timer
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  // Track event
  track(
    type: AnalyticsEventType,
    name: string,
    properties: Record<string, any> = {},
    value?: number,
    category?: string,
    tags?: string[]
  ): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type,
      name,
      timestamp: new Date(),
      sessionId: this.session.id,
      properties,
      value,
      category,
      tags,
    };

    this.events.push(event);
    this.session.events.push(event);

    // Update session metrics
    this.updateSessionMetrics(event);

    // Flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  // Update session metrics
  private updateSessionMetrics(event: AnalyticsEvent): void {
    switch (event.type) {
      case AnalyticsEventType.PAGE_VIEW:
        this.session.pageViews++;
        break;
      case AnalyticsEventType.USER_ACTION:
        this.session.userActions++;
        break;
      case AnalyticsEventType.ERROR:
        this.session.errors++;
        break;
    }
  }

  // Track page view
  trackPageView(url: string, title?: string): void {
    this.track(
      AnalyticsEventType.PAGE_VIEW,
      'page_view',
      {
        url,
        title: title || document.title,
        referrer: document.referrer,
      },
      undefined,
      'navigation'
    );
  }

  // Track user action
  trackUserAction(
    action: string,
    properties: Record<string, any> = {},
    value?: number
  ): void {
    this.track(
      AnalyticsEventType.USER_ACTION,
      action,
      properties,
      value,
      'user_interaction'
    );
  }

  // Track API call
  trackApiCall(
    url: string,
    method: string,
    status: number,
    duration: number,
    error?: string
  ): void {
    this.track(
      AnalyticsEventType.API_CALL,
      'api_call',
      {
        url,
        method,
        status,
        duration,
        error,
      },
      duration,
      'api',
      error ? ['error'] : ['success']
    );
  }

  // Track error
  trackError(
    error: Error,
    context?: Record<string, any>
  ): void {
    this.track(
      AnalyticsEventType.ERROR,
      'error',
      {
        message: error.message,
        stack: error.stack,
        context,
      },
      undefined,
      'error',
      ['critical']
    );
  }

  // Track performance
  trackPerformance(
    metric: string,
    value: number,
    properties: Record<string, any> = {}
  ): void {
    this.track(
      AnalyticsEventType.PERFORMANCE,
      metric,
      properties,
      value,
      'performance'
    );
  }

  // Track business event
  trackBusinessEvent(
    event: string,
    properties: Record<string, any> = {},
    value?: number
  ): void {
    this.track(
      AnalyticsEventType.BUSINESS_EVENT,
      event,
      properties,
      value,
      'business'
    );
  }

  // Track system event
  trackSystemEvent(
    event: string,
    properties: Record<string, any> = {}
  ): void {
    this.track(
      AnalyticsEventType.SYSTEM_EVENT,
      event,
      properties,
      undefined,
      'system'
    );
  }

  // Flush events to storage/server
  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // In a real application, send to analytics server
      console.log('Flushing analytics events:', eventsToFlush.length);
      
      // Store in localStorage as fallback
      this.storeEvents(eventsToFlush);
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-add events if flush failed
      this.events.unshift(...eventsToFlush);
    }
  }

  // Store events in localStorage
  private storeEvents(events: AnalyticsEvent[]): void {
    try {
      const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      const allEvents = [...existingEvents, ...events];
      
      // Keep only last 1000 events
      const trimmedEvents = allEvents.slice(-1000);
      
      localStorage.setItem('analytics_events', JSON.stringify(trimmedEvents));
    } catch (error) {
      console.error('Failed to store analytics events:', error);
    }
  }

  // Generate analytics report
  generateReport(startDate: Date, endDate: Date): AnalyticsReport {
    const sessions = this.getSessionsInPeriod(startDate, endDate);
    
    return {
      period: { start: startDate, end: endDate },
      sessions,
      metrics: this.calculateMetrics(sessions),
      topPages: this.getTopPages(sessions),
      topEvents: this.getTopEvents(sessions),
      userSegments: this.getUserSegments(sessions),
    };
  }

  // Get sessions in period
  private getSessionsInPeriod(startDate: Date, endDate: Date): AnalyticsSession[] {
    // In a real application, fetch from database
    // For now, return current session
    return [this.session];
  }

  // Calculate metrics
  private calculateMetrics(sessions: AnalyticsSession[]) {
    const totalSessions = sessions.length;
    const totalUsers = new Set(sessions.map(s => s.userId)).size;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    
    const pageViews = sessions.reduce((sum, s) => sum + s.pageViews, 0);
    const userActions = sessions.reduce((sum, s) => sum + s.userActions, 0);
    const errors = sessions.reduce((sum, s) => sum + s.errors, 0);
    
    const bounceRate = this.calculateBounceRate(sessions);
    const conversionRate = this.calculateConversionRate(sessions);
    
    const performance = {
      avgPageLoadTime: performanceMonitor.getMetrics().pageLoadTime,
      avgApiResponseTime: performanceMonitor.getMetrics().apiResponseTime,
      errorRate: performanceMonitor.getMetrics().errorRate,
      performanceScore: performanceMonitor.getPerformanceScore(),
    };

    return {
      totalSessions,
      totalUsers,
      avgSessionDuration,
      bounceRate,
      pageViews,
      uniquePageViews: pageViews, // Simplified
      userActions,
      errors,
      conversionRate,
      performance,
    };
  }

  // Calculate bounce rate
  private calculateBounceRate(sessions: AnalyticsSession[]): number {
    const bouncedSessions = sessions.filter(s => s.pageViews === 1).length;
    return sessions.length > 0 ? bouncedSessions / sessions.length : 0;
  }

  // Calculate conversion rate
  private calculateConversionRate(sessions: AnalyticsSession[]): number {
    // Simplified: sessions with user actions / total sessions
    const convertedSessions = sessions.filter(s => s.userActions > 0).length;
    return sessions.length > 0 ? convertedSessions / sessions.length : 0;
  }

  // Get top pages
  private getTopPages(sessions: AnalyticsSession[]) {
    const pageViews: Record<string, number> = {};
    
    sessions.forEach(session => {
      session.events
        .filter(e => e.type === AnalyticsEventType.PAGE_VIEW)
        .forEach(event => {
          const url = event.properties.url;
          pageViews[url] = (pageViews[url] || 0) + 1;
        });
    });
    
    return Object.entries(pageViews)
      .map(([url, views]) => ({
        url,
        views,
        uniqueViews: views, // Simplified
        avgDuration: 0, // Simplified
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  // Get top events
  private getTopEvents(sessions: AnalyticsSession[]) {
    const eventCounts: Record<string, { count: number; users: Set<string>; totalValue: number }> = {};
    
    sessions.forEach(session => {
      session.events.forEach(event => {
        const key = event.name;
        if (!eventCounts[key]) {
          eventCounts[key] = { count: 0, users: new Set(), totalValue: 0 };
        }
        
        eventCounts[key].count++;
        if (session.userId) {
          eventCounts[key].users.add(session.userId);
        }
        
        if (event.value !== undefined) {
          eventCounts[key].totalValue += event.value;
        }
      });
    });
    
    return Object.entries(eventCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        uniqueUsers: data.users.size,
        avgValue: data.totalValue / data.count || undefined,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Get user segments
  private getUserSegments(sessions: AnalyticsSession[]) {
    const segments = {
      new_users: 0,
      returning_users: 0,
      mobile_users: 0,
      desktop_users: 0,
    };
    
    sessions.forEach(session => {
      // Simplified segmentation
      if (session.userAgent.includes('Mobile')) {
        segments.mobile_users++;
      } else {
        segments.desktop_users++;
      }
      
      // New vs returning would require historical data
      segments.returning_users++;
    });
    
    const total = sessions.length;
    
    return Object.entries(segments)
      .map(([segment, count]) => ({
        segment: segment.replace(/_/g, ' '),
        count,
        percentage: total > 0 ? count / total : 0,
      }));
  }

  // Set user ID
  setUserId(userId: string): void {
    this.session.userId = userId;
  }

  // Get current session
  getCurrentSession(): AnalyticsSession {
    return { ...this.session };
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Cleanup
  cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// React Hook for Analytics
export function useAnalytics() {
  const analytics = ProfessionalAnalytics.getInstance();
  
  return {
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackApiCall: analytics.trackApiCall.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackBusinessEvent: analytics.trackBusinessEvent.bind(analytics),
    trackSystemEvent: analytics.trackSystemEvent.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    getCurrentSession: analytics.getCurrentSession.bind(analytics),
  };
}

// React Component for Analytics Tracking
export function AnalyticsTracker({ children }: { children: React.ReactNode }) {
  const analytics = useAnalytics();
  
  React.useEffect(() => {
    // Track page view on mount
    analytics.trackPageView(window.location.href, document.title);
    
    // Track performance metrics
    const metrics = performanceMonitor.getMetrics();
    analytics.trackPerformance('page_load_time', metrics.pageLoadTime);
    analytics.trackPerformance('first_contentful_paint', metrics.firstContentfulPaint);
    
    // Setup error tracking
    const handleError = (event: ErrorEvent) => {
      analytics.trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [analytics]);
  
  return <>{children}</>;
}

// Create singleton instance
export const analytics = ProfessionalAnalytics.getInstance();

// Convenience functions
export const trackPageView = (url: string, title?: string) => {
  analytics.trackPageView(url, title);
};

export const trackUserAction = (action: string, properties?: Record<string, any>, value?: number) => {
  analytics.trackUserAction(action, properties, value);
};

export const trackApiCall = (url: string, method: string, status: number, duration: number, error?: string) => {
  analytics.trackApiCall(url, method, status, duration, error);
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  analytics.trackError(error, context);
};

export const trackBusinessEvent = (event: string, properties?: Record<string, any>, value?: number) => {
  analytics.trackBusinessEvent(event, properties, value);
};

export default ProfessionalAnalytics;
