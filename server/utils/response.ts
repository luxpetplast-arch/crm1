export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ResponseHelper {
  
  static success<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
    return {
      success: true,
      data,
      meta
    };
  }

  static error(code: string, message: string, details?: any): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details
      }
    };
  }

  // Common error responses
  static badRequest(message: string, details?: any) {
    return this.error('BAD_REQUEST', message, details);
  }

  static notFound(entity: string) {
    return this.error('NOT_FOUND', `${entity} topilmadi`);
  }

  static unauthorized() {
    return this.error('UNAUTHORIZED', 'Ruxsat yo\'q');
  }

  static forbidden() {
    return this.error('FORBIDDEN', 'Amalga oshirish taqiqlangan');
  }

  static internalError(message?: string) {
    return this.error('INTERNAL_ERROR', message || 'Server xatosi');
  }

  static validationError(errors: any[]) {
    return this.error('VALIDATION_ERROR', 'Validatsiya xatosi', errors);
  }
}

// Legacy support - for backward compatibility
export const formatSuccess = <T>(data: T, meta?: ApiResponse['meta']) => 
  ResponseHelper.success(data, meta);

export const formatError = (code: string, message: string, details?: any) => 
  ResponseHelper.error(code, message, details);
