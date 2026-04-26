// Professional Error Handling System for LUX PET PLAST

// Error Types
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  DATABASE = 'DATABASE',
  UNKNOWN = 'UNKNOWN',
}

// Error Severity Levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error Categories
export enum ErrorCategory {
  USER_INPUT = 'user_input',
  SYSTEM = 'system',
  EXTERNAL_SERVICE = 'external_service',
  DATABASE = 'database',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  BUSINESS_LOGIC = 'business_logic',
}

// Error Interface
export interface ProfessionalError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  userMessage: string;
  code?: string;
  details?: any;
  timestamp: Date;
  stack?: string;
  context?: {
    userId?: string;
    action?: string;
    resource?: string;
    userAgent?: string;
    url?: string;
    [key: string]: any;
  };
  retryable: boolean;
  reported: boolean;
}

// Error Handler Options
export interface ErrorHandlerOptions {
  enableLogging: boolean;
  enableReporting: boolean;
  maxRetries: number;
  retryDelay: number;
  enableUserNotifications: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

// Error Handler Class
export class ProfessionalErrorHandler {
  private static instance: ProfessionalErrorHandler;
  private errors: Map<string, ProfessionalError> = new Map();
  private options: ErrorHandlerOptions;
  private errorCounts: Map<string, number> = new Map();

  constructor(options: Partial<ErrorHandlerOptions> = {}) {
    this.options = {
      enableLogging: true,
      enableReporting: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableUserNotifications: true,
      logLevel: 'error',
      ...options,
    };
  }

  static getInstance(options?: Partial<ErrorHandlerOptions>): ProfessionalErrorHandler {
    if (!ProfessionalErrorHandler.instance) {
      ProfessionalErrorHandler.instance = new ProfessionalErrorHandler(options);
    }
    return ProfessionalErrorHandler.instance;
  }

  // Handle Error
  handleError(
    error: Error | any,
    context?: Partial<ProfessionalError['context']>
  ): ProfessionalError {
    const professionalError = this.createProfessionalError(error, context);
    
    // Store error
    this.errors.set(professionalError.id, professionalError);
    
    // Increment error count
    const errorKey = `${professionalError.type}_${professionalError.code}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
    
    // Log error
    if (this.options.enableLogging) {
      this.logError(professionalError);
    }
    
    // Report error
    if (this.options.enableReporting && !professionalError.reported) {
      this.reportError(professionalError);
    }
    
    // Show user notification
    if (this.options.enableUserNotifications) {
      this.showUserNotification(professionalError);
    }
    
    return professionalError;
  }

  // Create Professional Error
  private createProfessionalError(
    error: Error | any,
    context?: Partial<ProfessionalError['context']>
  ): ProfessionalError {
    const id = this.generateErrorId();
    const timestamp = new Date();
    
    // Determine error type
    const type = this.determineErrorType(error);
    
    // Determine severity
    const severity = this.determineErrorSeverity(error, type);
    
    // Determine category
    const category = this.determineErrorCategory(error, type);
    
    // Create user-friendly message
    const userMessage = this.createUserMessage(error, type);
    
    // Check if retryable
    const retryable = this.isRetryable(error, type);
    
    return {
      id,
      type,
      severity,
      category,
      message: error.message || 'Unknown error occurred',
      userMessage,
      code: error.code,
      details: error.details || error,
      timestamp,
      stack: error.stack,
      context: {
        userId: this.getCurrentUserId(),
        action: this.getCurrentAction(),
        resource: this.getCurrentResource(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context,
      },
      retryable,
      reported: false,
    };
  }

  // Determine Error Type
  private determineErrorType(error: any): ErrorType {
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return ErrorType.UNKNOWN;
    }
    
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
      return ErrorType.NETWORK;
    }
    
    if (error.status === 401) {
      return ErrorType.AUTHENTICATION;
    }
    
    if (error.status === 403) {
      return ErrorType.AUTHORIZATION;
    }
    
    if (error.status === 404) {
      return ErrorType.NOT_FOUND;
    }
    
    if (error.status >= 500) {
      return ErrorType.SERVER_ERROR;
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return ErrorType.TIMEOUT;
    }
    
    if (error.name === 'ValidationError') {
      return ErrorType.VALIDATION;
    }
    
    // Database errors
    if (error.code?.includes('DATABASE') || error.code?.includes('SQL') || 
        error.message?.includes('database') || error.message?.includes('connection') ||
        error.name === 'DatabaseError' || error.name === 'PrismaClientKnownRequestError') {
      return ErrorType.DATABASE;
    }
    
    return ErrorType.UNKNOWN;
  }

  // Determine Error Severity
  private determineErrorSeverity(error: any, type: ErrorType): ErrorSeverity {
    // Critical errors
    if (type === ErrorType.AUTHENTICATION || type === ErrorType.AUTHORIZATION) {
      return ErrorSeverity.HIGH;
    }
    
    if (type === ErrorType.SERVER_ERROR && error.status >= 500) {
      return ErrorSeverity.CRITICAL;
    }
    
    // High severity
    if (type === ErrorType.DATABASE || type === ErrorType.NETWORK) {
      return ErrorSeverity.HIGH;
    }
    
    // Medium severity
    if (type === ErrorType.VALIDATION || type === ErrorType.NOT_FOUND) {
      return ErrorSeverity.MEDIUM;
    }
    
    // Low severity
    return ErrorSeverity.LOW;
  }

  // Determine Error Category
  private determineErrorCategory(error: any, type: ErrorType): ErrorCategory {
    if (type === ErrorType.AUTHENTICATION || type === ErrorType.AUTHORIZATION) {
      return ErrorCategory.AUTHENTICATION;
    }
    
    if (type === ErrorType.NETWORK || type === ErrorType.TIMEOUT) {
      return ErrorCategory.NETWORK;
    }
    
    if (type === ErrorType.VALIDATION) {
      return ErrorCategory.USER_INPUT;
    }
    
    if (type === ErrorType.DATABASE) {
      return ErrorCategory.DATABASE;
    }
    
    if (type === ErrorType.SERVER_ERROR) {
      return ErrorCategory.SYSTEM;
    }
    
    return ErrorCategory.SYSTEM;
  }

  // Create User Message
  private createUserMessage(error: any, type: ErrorType): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK]: 'Tarmoq xatosi yuz berdi. Iltimos, internet aloqangizni tekshiring.',
      [ErrorType.VALIDATION]: 'Kiritilgan ma\'lumotlarda xatolik bor. Iltimos, tekshirib qayta urinib ko\'ring.',
      [ErrorType.AUTHENTICATION]: 'Sessiya muddati tugagan. Iltimos, qayta kiring.',
      [ErrorType.AUTHORIZATION]: 'Bu amalni bajarish uchun ruxsatingiz yo\'q.',
      [ErrorType.NOT_FOUND]: 'So\'ralgan ma\'lumot topilmadi.',
      [ErrorType.SERVER_ERROR]: 'Serverda xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.',
      [ErrorType.TIMEOUT]: 'Serverdan javob kechikyapti. Iltimos, qayta urinib ko\'ring.',
      [ErrorType.DATABASE]: 'Ma\'lumotlar bazasida xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.',
      [ErrorType.UNKNOWN]: 'Noma\'lum xatolik yuz berdi. Iltimos, qo\'llab-quvvatlash xizmatiga murojaat qiling.',
    };
    
    return messages[type] || messages[ErrorType.UNKNOWN];
  }

  // Check if Error is Retryable
  private isRetryable(error: any, type: ErrorType): boolean {
    const retryableTypes = [ErrorType.NETWORK, ErrorType.TIMEOUT, ErrorType.SERVER_ERROR, ErrorType.DATABASE];
    return retryableTypes.includes(type);
  }

  // Generate Error ID
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get Current User ID
  private getCurrentUserId(): string | undefined {
    try {
      const storage = localStorage.getItem('auth-storage');
      if (storage) {
        const parsed = JSON.parse(storage);
        return parsed.state?.user?.id;
      }
    } catch {}
    return undefined;
  }

  // Get Current Action
  private getCurrentAction(): string {
    return window.location.pathname + window.location.search;
  }

  // Get Current Resource
  private getCurrentResource(): string {
    return window.location.pathname.split('/')[1] || 'unknown';
  }

  // Log Error
  private logError(error: ProfessionalError): void {
    const logData = {
      id: error.id,
      type: error.type,
      severity: error.severity,
      category: error.category,
      message: error.message,
      userMessage: error.userMessage,
      code: error.code,
      timestamp: error.timestamp,
      context: error.context,
    };
    
    switch (this.options.logLevel) {
      case 'debug':
        console.debug('[ProfessionalErrorHandler]', logData);
        break;
      case 'info':
        console.info('[ProfessionalErrorHandler]', logData);
        break;
      case 'warn':
        console.warn('[ProfessionalErrorHandler]', logData);
        break;
      case 'error':
      default:
        console.error('[ProfessionalErrorHandler]', logData);
        break;
    }
  }

  // Report Error
  private async reportError(error: ProfessionalError): Promise<void> {
    try {
      // In a real application, you would send this to your error reporting service
      // For example: Sentry, Bugsnag, or custom endpoint
      
      const reportData = {
        ...error,
        timestamp: error.timestamp.toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      
      // Simulate reporting (in production, this would be an actual API call)
      console.log('Error reported:', reportData);
      
      // Mark as reported
      error.reported = true;
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  // Show User Notification
  private showUserNotification(error: ProfessionalError): void {
    // You can integrate with your notification system here
    // For example, show a toast, modal, or alert
    
    if (error.severity === ErrorSeverity.CRITICAL) {
      // Show critical error notification
      alert(`Xatolik: ${error.userMessage}`);
    } else if (error.severity === ErrorSeverity.HIGH) {
      // Show high severity notification
      console.warn(`Xatolik: ${error.userMessage}`);
    } else {
      // Show normal notification
      console.info(`Xatolik: ${error.userMessage}`);
    }
  }

  // Get Error Statistics
  getErrorStats(): {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    byCategory: Record<ErrorCategory, number>;
    recent: ProfessionalError[];
  } {
    const errors = Array.from(this.errors.values());
    
    const byType = Object.values(ErrorType).reduce((acc, type) => {
      acc[type] = errors.filter(e => e.type === type).length;
      return acc;
    }, {} as Record<ErrorType, number>);
    
    const bySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = errors.filter(e => e.severity === severity).length;
      return acc;
    }, {} as Record<ErrorSeverity, number>);
    
    const byCategory = Object.values(ErrorCategory).reduce((acc, category) => {
      acc[category] = errors.filter(e => e.category === category).length;
      return acc;
    }, {} as Record<ErrorCategory, number>);
    
    const recent = errors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
    
    return {
      total: errors.length,
      byType,
      bySeverity,
      byCategory,
      recent,
    };
  }

  // Clear Errors
  clearErrors(): void {
    this.errors.clear();
    this.errorCounts.clear();
  }

  // Get Error by ID
  getError(id: string): ProfessionalError | undefined {
    return this.errors.get(id);
  }

  // Retry Operation
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries?: number
  ): Promise<T> {
    const retries = maxRetries || this.options.maxRetries;
    let lastError: any;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === retries) {
          this.handleError(error, { retryAttempt: attempt });
          throw error;
        }
        
        // Wait before retry
        await this.sleep(this.options.retryDelay * attempt);
      }
    }
    
    throw lastError;
  }

  // Sleep helper
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
export const errorHandler = ProfessionalErrorHandler.getInstance();

// Convenience functions
export const handleError = (error: Error | any, context?: Partial<ProfessionalError['context']>) => {
  return errorHandler.handleError(error, context);
};

export const retryOperation = <T>(operation: () => Promise<T>, maxRetries?: number) => {
  return errorHandler.retryOperation(operation, maxRetries);
};

export const getErrorStats = () => {
  return errorHandler.getErrorStats();
};

export const clearErrors = () => {
  errorHandler.clearErrors();
};

export default ProfessionalErrorHandler;
