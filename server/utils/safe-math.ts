/**
 * Safe Math Utilities
 * Division by zero protection and safe number parsing
 */

/**
 * Safe division - returns 0 if divisor is 0 or invalid
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
 * Safe parseFloat with validation
 */
export function safeParseFloat(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return isFinite(value) ? value : defaultValue;
  const parsed = parseFloat(String(value));
  return isFinite(parsed) ? parsed : defaultValue;
}

/**
 * Safe parseInt with validation
 */
export function safeParseInt(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return isFinite(value) ? Math.floor(value) : defaultValue;
  const parsed = parseInt(String(value), 10);
  return isFinite(parsed) ? parsed : defaultValue;
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  if (!json || typeof json !== 'string') return defaultValue;
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Safe JSON stringify with error handling
 */
export function safeJsonStringify(value: any, defaultValue: string = '{}'): string {
  try {
    return JSON.stringify(value);
  } catch {
    return defaultValue;
  }
}

/**
 * Validate positive number (for prices, quantities)
 */
export function validatePositiveNumber(value: any, fieldName: string, defaultValue: number = 0): number {
  const parsed = safeParseFloat(value, defaultValue);
  if (parsed < 0) {
    console.warn(`[Validation] ${fieldName} cannot be negative: ${value}, using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

/**
 * Validate positive integer (for counts)
 */
export function validatePositiveInt(value: any, fieldName: string, defaultValue: number = 0): number {
  const parsed = safeParseInt(value, defaultValue);
  if (parsed < 0) {
    console.warn(`[Validation] ${fieldName} cannot be negative: ${value}, using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

/**
 * Calculate average safely
 */
export function safeAverage(values: number[], defaultValue: number = 0): number {
  if (!Array.isArray(values) || values.length === 0) return defaultValue;
  const validValues = values.filter(v => isFinite(v));
  if (validValues.length === 0) return defaultValue;
  return validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
}

/**
 * Calculate sum safely
 */
export function safeSum(values: number[], defaultValue: number = 0): number {
  if (!Array.isArray(values)) return defaultValue;
  return values.filter(v => isFinite(v)).reduce((sum, v) => sum + v, 0);
}

/**
 * Safe growth rate calculation
 */
export function safeGrowthRate(current: number, previous: number, defaultValue: number = 0): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // 100% growth if started from 0
  }
  return safePercentage(current - previous, previous, defaultValue);
}

/**
 * Safe ratio calculation
 */
export function safeRatio(numerator: number, denominator: number, defaultValue: number = 0): number {
  return safeDivide(numerator, denominator, defaultValue);
}

/**
 * Round to fixed decimals safely
 */
export function safeRound(value: number, decimals: number = 2): number {
  if (!isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  if (!isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}
