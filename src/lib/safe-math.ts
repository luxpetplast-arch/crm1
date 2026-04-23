/**
 * Safe Math Utilities for Frontend
 * Validation for parseFloat/parseInt with NaN and negative checks
 */

/**
 * Safe parseFloat with validation for NaN and negative values
 */
export function safeParseFloat(value: any, defaultValue: number = 0, allowNegative: boolean = false): number {
  if (value === null || value === undefined || value === '') return defaultValue;
  
  const parsed = parseFloat(String(value));
  
  if (isNaN(parsed)) {
    console.warn(`[safeParseFloat] Invalid number: ${value}, using default: ${defaultValue}`);
    return defaultValue;
  }
  
  if (!allowNegative && parsed < 0) {
    console.warn(`[safeParseFloat] Negative value not allowed: ${parsed}, using default: ${defaultValue}`);
    return defaultValue;
  }
  
  return parsed;
}

/**
 * Safe parseInt with validation
 */
export function safeParseInt(value: any, defaultValue: number = 0, allowNegative: boolean = false): number {
  if (value === null || value === undefined || value === '') return defaultValue;
  
  const parsed = parseInt(String(value), 10);
  
  if (isNaN(parsed)) {
    console.warn(`[safeParseInt] Invalid integer: ${value}, using default: ${defaultValue}`);
    return defaultValue;
  }
  
  if (!allowNegative && parsed < 0) {
    console.warn(`[safeParseInt] Negative value not allowed: ${parsed}, using default: ${defaultValue}`);
    return defaultValue;
  }
  
  return parsed;
}

/**
 * Safe division by zero protection
 */
export function safeDivide(numerator: number, divisor: number, defaultValue: number = 0): number {
  if (!isFinite(divisor) || !isFinite(numerator)) return defaultValue;
  if (divisor === 0) return defaultValue;
  if (numerator === 0) return 0;
  return numerator / divisor;
}

/**
 * Safe percentage calculation
 */
export function safePercentage(numerator: number, divisor: number, defaultValue: number = 0): number {
  return safeDivide(numerator, divisor, defaultValue) * 100;
}

/**
 * Validate positive number (for prices, quantities)
 */
export function validatePositiveNumber(value: any, fieldName: string, defaultValue: number = 0): number {
  const parsed = safeParseFloat(value, defaultValue);
  if (parsed <= 0) {
    console.warn(`[Validation] ${fieldName} must be positive: ${value}`);
    return defaultValue;
  }
  return parsed;
}

/**
 * Validate quantity (positive integer)
 */
export function validateQuantity(value: any, fieldName: string, defaultValue: number = 1): number {
  const parsed = safeParseInt(value, defaultValue);
  if (parsed <= 0) {
    console.warn(`[Validation] ${fieldName} must be positive integer: ${value}`);
    return defaultValue;
  }
  return parsed;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  if (!isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Format number with fixed decimals safely
 */
export function safeToFixed(value: number, decimals: number = 2): string {
  if (!isFinite(value)) return '0';
  return value.toFixed(decimals);
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  if (!json || typeof json !== 'string') return defaultValue;
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    console.warn('[safeJsonParse] Failed to parse JSON:', json);
    return defaultValue;
  }
}

/**
 * Safe JSON stringify
 */
export function safeJsonStringify(value: any, defaultValue: string = '{}'): string {
  try {
    return JSON.stringify(value);
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Safe array access - returns default if not an array
 */
export function safeArray<T>(value: any, defaultValue: T[] = []): T[] {
  if (!value || !Array.isArray(value)) return defaultValue;
  return value;
}

/**
 * Safe map - only maps if value is an array
 */
export function safeMap<T, R>(value: any, mapper: (item: T) => R, defaultValue: R[] = []): R[] {
  if (!value || !Array.isArray(value)) return defaultValue;
  return value.map(mapper);
}

/**
 * Safe object access - returns default if not an object
 */
export function safeObject<T extends object>(value: any, defaultValue: T = {} as T): T {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaultValue;
  return value;
}

/**
 * Safe API response handler
 */
export function safeApiResponse<T>(response: any, defaultValue: T): T {
  if (!response) return defaultValue;
  if (response.data !== undefined) return response.data;
  return defaultValue;
}

/**
 * Safe filter - only filters if value is an array
 */
export function safeFilter<T>(value: any, predicate: (item: T) => boolean, defaultValue: T[] = []): T[] {
  if (!value || !Array.isArray(value)) return defaultValue;
  return value.filter(predicate);
}

/**
 * Safe reduce - only reduces if value is an array
 */
export function safeReduce<T, R>(value: any, reducer: (acc: R, item: T) => R, initialValue: R): R {
  if (!value || !Array.isArray(value)) return initialValue;
  return value.reduce(reducer, initialValue);
}

/**
 * Safe string access
 */
export function safeString(value: any, defaultValue: string = ''): string {
  if (value === null || value === undefined) return defaultValue;
  return String(value);
}

/**
 * Safe boolean access
 */
export function safeBoolean(value: any, defaultValue: boolean = false): boolean {
  if (value === null || value === undefined) return defaultValue;
  return Boolean(value);
}
