// Professional Utility Functions for LUX PET PLAST

// Currency Utils
export class CurrencyUtils {
  static formatUZS(amount: number): string {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  static formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  static convertToUSD(amountUZS: number, exchangeRate: number): number {
    return amountUZS / exchangeRate;
  }

  static convertToUZS(amountUSD: number, exchangeRate: number): number {
    return amountUSD * exchangeRate;
  }

  static parseAmount(value: string): number {
    const cleaned = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  static isValidAmount(value: string): boolean {
    const amount = this.parseAmount(value);
    return !isNaN(amount) && amount >= 0;
  }
}

// Date Utils
export class DateUtils {
  static format(date: Date | string, format: 'short' | 'long' | 'time' | 'datetime' = 'short'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString('uz-UZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      case 'long':
        return dateObj.toLocaleDateString('uz-UZ', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      case 'time':
        return dateObj.toLocaleTimeString('uz-UZ', {
          hour: '2-digit',
          minute: '2-digit',
        });
      case 'datetime':
        return dateObj.toLocaleString('uz-UZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      default:
        return dateObj.toLocaleDateString('uz-UZ');
    }
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  static isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  }

  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'hozirgina';
    if (diffMins < 60) return `${diffMins} daqiqa oldin`;
    if (diffHours < 24) return `${diffHours} soat oldin`;
    if (diffDays < 7) return `${diffDays} kun oldin`;
    
    return this.format(date, 'short');
  }

  static getStartOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  static getEndOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  static getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1);
    result.setDate(diff);
    return this.getStartOfDay(result);
  }

  static getStartOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setDate(1);
    return this.getStartOfDay(result);
  }

  static getStartOfYear(date: Date): Date {
    const result = new Date(date);
    result.setMonth(0, 1);
    return this.getStartOfDay(result);
  }
}

// String Utils
export class StringUtils {
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }

  static slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static generateId(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateNumericId(length: number = 6): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+998|998)?\s?(90|91|92|93|94|95|96|97|98|99)\s?\d{3}\s?\d{2}\s?\d{2}$/;
    return phoneRegex.test(phone);
  }

  static normalizePhone(phone: string): string {
    const cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.startsWith('998')) {
      return `+${cleaned}`;
    }
    return `+998${cleaned}`;
  }

  static extractNumbers(str: string): string {
    return str.replace(/[^\d]/g, '');
  }

  static maskString(str: string, start: number = 0, end: number = str.length, mask: string = '*'): string {
    if (start >= str.length) return str;
    if (end > str.length) end = str.length;
    
    const before = str.substring(0, start);
    const middle = str.substring(start, end).replace(/./g, mask);
    const after = str.substring(end);
    
    return before + middle + after;
  }
}

// Array Utils
export class ArrayUtils {
  static groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  static uniqueBy<T, K extends keyof T>(array: T[], key: K): T[] {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  static sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static sum<T>(array: T[], key: keyof T): number {
    return array.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
  }

  static average<T>(array: T[], key: keyof T): number {
    if (array.length === 0) return 0;
    return this.sum(array, key) / array.length;
  }

  static max<T>(array: T[], key: keyof T): T | undefined {
    return array.reduce((max, item) => {
      if (!max || Number(item[key]) > Number(max[key])) {
        return item;
      }
      return max;
    }, undefined as T | undefined);
  }

  static min<T>(array: T[], key: keyof T): T | undefined {
    return array.reduce((min, item) => {
      if (!min || Number(item[key]) < Number(min[key])) {
        return item;
      }
      return min;
    }, undefined as T | undefined);
  }
}

// Object Utils
export class ObjectUtils {
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array) return obj.map(item => this.deepClone(item)) as unknown as T;
    
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  }

  static deepMerge<T extends object>(target: T, source: Partial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];
        
        if (this.isObject(sourceValue) && this.isObject(targetValue)) {
          result[key] = this.deepMerge(targetValue, sourceValue);
        } else {
          result[key] = sourceValue as T[Extract<keyof T, string>];
        }
      }
    }
    
    return result;
  }

  static isObject(value: any): value is object {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  static omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  }

  static isEmpty(value: any): boolean {
    if (value == null) return true;
    if (Array.isArray(value) || typeof value === 'string') return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  static hasPath(obj: any, path: string): boolean {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || !current.hasOwnProperty(key)) {
        return false;
      }
      current = current[key];
    }
    
    return true;
  }

  static getPath(obj: any, path: string, defaultValue: any = undefined): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || !current.hasOwnProperty(key)) {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current;
  }

  static setPath(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;
    
    for (const key of keys) {
      if (!(key in current) || !this.isObject(current[key])) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey!] = value;
  }
}

// Storage Utils
export class StorageUtils {
  static set(key: string, value: any, ttl?: number): void {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        ttl: ttl ? Date.now() + ttl : undefined,
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  static get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      const parsed = JSON.parse(item);
      
      // Check TTL
      if (parsed.ttl && Date.now() > parsed.ttl) {
        localStorage.removeItem(key);
        return defaultValue;
      }
      
      return parsed.value;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  static keys(): string[] {
    return Object.keys(localStorage);
  }

  static size(): number {
    return localStorage.length;
  }
}

// Math Utils
export class MathUtils {
  static round(value: number, precision: number = 2): number {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  static randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  static randomIntBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static percentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  static isEven(number: number): boolean {
    return number % 2 === 0;
  }

  static isOdd(number: number): boolean {
    return number % 2 !== 0;
  }

  static gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  static lcm(a: number, b: number): number {
    return Math.abs(a * b) / this.gcd(a, b);
  }

  static factorial(n: number): number {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }

  static fibonacci(n: number): number {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }
}

// File Utils
export class FileUtils {
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  static getFileName(filename: string): string {
    return filename.replace(/^.*[\\/]/, '');
  }

  static isValidImageType(filename: string): boolean {
    const validTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const extension = this.getFileExtension(filename).toLowerCase();
    return validTypes.includes(extension);
  }

  static isValidDocumentType(filename: string): boolean {
    const validTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
    const extension = this.getFileExtension(filename).toLowerCase();
    return validTypes.includes(extension);
  }

  static downloadFile(data: any, filename: string, type: string = 'application/json'): void {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  static readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}

// Device Utils
export class DeviceUtils {
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  static isTablet(): boolean {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
  }

  static isDesktop(): boolean {
    return !this.isMobile() && !this.isTablet();
  }

  static isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  static isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  static isSafari(): boolean {
    return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  }

  static isChrome(): boolean {
    return /Chrome/.test(navigator.userAgent);
  }

  static isFirefox(): boolean {
    return /Firefox/.test(navigator.userAgent);
  }

  static getScreenSize(): { width: number; height: number } {
    return {
      width: window.screen.width,
      height: window.screen.height,
    };
  }

  static getViewportSize(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  static copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve();
    }
  }
}

