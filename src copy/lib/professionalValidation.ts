// Professional Validation System for LUX PET PLAST

// Validation Rule Types
export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

// Common Validation Patterns
export const Patterns = {
  // Uzbek phone number patterns
  PHONE_UZ: /^(\+998|998)?\s?(90|91|92|93|94|95|96|97|98|99)\s?\d{3}\s?\d{2}\s?\d{2}$/,
  PHONE_UZ_STRICT: /^\+998\s?(90|91|92|93|94|95|96|97|98|99)\s?\d{3}\s?\d{2}\s?\d{2}$/,
  
  // Email patterns
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  EMAIL_UZ: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(uz|ru|com)$/,
  
  // Product codes
  PRODUCT_CODE: /^[A-Z0-9]{3,12}$/,
  BARCODE: /^\d{8,13}$/,
  
  // Financial patterns
  AMOUNT: /^\d+(\.\d{1,2})?$/,
  PRICE_UZS: /^\d{1,8}(\.\d{0,2})?$/,
  PRICE_USD: /^\d{1,6}(\.\d{0,2})?$/,
  
  // Address patterns
  ADDRESS_UZ: /^[a-zA-Z0-9\u0400-\u04FF\s\-\.,\u0027]{10,200}$/,
  
  // Name patterns (Latin and Cyrillic)
  NAME_UZ: /^[a-zA-Z\u0400-\u04FF\s]{2,50}$/,
  COMPANY_NAME: /^[a-zA-Z0-9\u0400-\u04FF\s\-\.\u0027]{3,100}$/,
  
  // Document patterns
  PASSPORT_UZ: /^[A-Z]{2}\d{7}$/,
  INN: /^\d{9}$/,
  
  // Vehicle patterns
  CAR_PLATE_UZ: /^\d{2}[A-Z]{2}\d{3}[A-Z]{2}$/,
};

// Validation Messages (Uzbek)
export const Messages = {
  required: (field: string) => `${field} maydoni to'ldirilishi shart`,
  minLength: (field: string, min: number) => `${field} kamida ${min} ta belgidan iborat bo'lishi kerak`,
  maxLength: (field: string, max: number) => `${field} ko'pi bilan ${max} ta belgidan oshmasligi kerak`,
  min: (field: string, min: number) => `${field} ${min} dan katta bo'lishi kerak`,
  max: (field: string, max: number) => `${field} ${max} dan kichik bo'lishi kerak`,
  invalidEmail: 'Email manzili noto\'g\'ri formatda',
  invalidPhone: 'Telefon raqami noto\'g\'ri formatda. Masalan: +998 90 123 45 67',
  invalidPrice: 'Narx noto\'g\'ri formatda',
  invalidAmount: 'Miqdor noto\'g\'ri formatda',
  invalidProductCode: 'Mahsulot kodi noto\'g\'ri formatda',
  invalidBarcode: 'Barkod noto\'g\'ri formatda',
  invalidPassport: 'Passport seriyasi noto\'g\'ri formatda',
  invalidINN: 'INN raqami noto\'g\'ri formatda',
  invalidCarPlate: 'Avtomobil raqami noto\'g\'ri formatda',
  passwordTooWeak: 'Parol juda zaif. Kamida 8 ta belgi, katta va kichik harflar hamda raqamlar bo\'lishi kerak',
  passwordsNotMatch: 'Parollar mos kelmadi',
  invalidDate: 'Sana noto\'g\'ri formatda',
  futureDate: 'Sana kelajakda bo\'lishi mumkin emas',
  pastDate: 'Sana o\'tmishda bo\'lishi kerak',
  fileTooBig: 'Fayl hajmi juda katta',
  invalidFileType: 'Fayl turi qabul qilinmaydi',
  networkError: 'Tarmoq xatosi. Iltimos, qayta urinib ko\'ring',
  serverError: 'Server xatosi. Iltimos, keyinroq urinib ko\'ring',
};

// Professional Validator Class
export class ProfessionalValidator {
  private static instance: ProfessionalValidator;
  private schemas: Map<string, ValidationSchema> = new Map();

  static getInstance(): ProfessionalValidator {
    if (!ProfessionalValidator.instance) {
      ProfessionalValidator.instance = new ProfessionalValidator();
    }
    return ProfessionalValidator.instance;
  }

  // Register validation schema
  registerSchema(name: string, schema: ValidationSchema): void {
    this.schemas.set(name, schema);
  }

  // Validate data against schema
  validate(data: any, schema: string | ValidationSchema): ValidationResult {
    const validationSchema = typeof schema === 'string' 
      ? this.schemas.get(schema) 
      : schema;

    if (!validationSchema) {
      throw new Error(`Validation schema '${schema}' not found`);
    }

    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    for (const [field, rules] of Object.entries(validationSchema)) {
      const value = data[field];
      
      for (const rule of rules) {
        const error = this.validateField(value, rule, field, data);
        if (error) {
          if (rule.required || rule.minLength || rule.maxLength || rule.min || rule.max) {
            errors[field] = error;
          } else {
            warnings[field] = error;
          }
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    };
  }

  // Validate single field
  private validateField(value: any, rule: ValidationRule, field: string, data: any): string | null {
    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      return rule.message || Messages.required(field);
    }

    // Skip other validations if field is empty and not required
    if (value === undefined || value === null || value === '') {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return rule.message || Messages.minLength(field, rule.minLength);
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return rule.message || Messages.maxLength(field, rule.maxLength);
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message;
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return rule.message || Messages.min(field, rule.min);
      }

      if (rule.max !== undefined && value > rule.max) {
        return rule.message || Messages.max(field, rule.max);
      }
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }

  // Quick validation methods
  static email(email: string): boolean {
    return Patterns.EMAIL.test(email);
  }

  static phoneUZ(phone: string): boolean {
    return Patterns.PHONE_UZ.test(phone);
  }

  static priceUZS(price: string | number): boolean {
    const value = typeof price === 'string' ? price : price.toString();
    return Patterns.PRICE_UZS.test(value);
  }

  static priceUSD(price: string | number): boolean {
    const value = typeof price === 'string' ? price : price.toString();
    return Patterns.PRICE_USD.test(value);
  }

  static productCode(code: string): boolean {
    return Patterns.PRODUCT_CODE.test(code);
  }

  static barcode(barcode: string): boolean {
    return Patterns.BARCODE.test(barcode);
  }

  static nameUZ(name: string): boolean {
    return Patterns.NAME_UZ.test(name);
  }

  static addressUZ(address: string): boolean {
    return Patterns.ADDRESS_UZ.test(address);
  }

  static passportUZ(passport: string): boolean {
    return Patterns.PASSPORT_UZ.test(passport);
  }

  static inn(inn: string): boolean {
    return Patterns.INN.test(inn);
  }

  static carPlateUZ(plate: string): boolean {
    return Patterns.CAR_PLATE_UZ.test(plate);
  }
}

// Predefined Schemas
export const Schemas = {
  // Customer schema
  customer: {
    name: [
      { field: 'name', required: true, minLength: 2, maxLength: 50, pattern: Patterns.NAME_UZ },
    ],
    phone: [
      { field: 'phone', required: true, pattern: Patterns.PHONE_UZ, message: Messages.invalidPhone },
    ],
    email: [
      { field: 'email', pattern: Patterns.EMAIL, message: Messages.invalidEmail },
    ],
    address: [
      { field: 'address', minLength: 10, maxLength: 200, pattern: Patterns.ADDRESS_UZ },
    ],
    debtUZS: [
      { field: 'debtUZS', min: 0, pattern: Patterns.PRICE_UZS, message: Messages.invalidPrice },
    ],
    debtUSD: [
      { field: 'debtUSD', min: 0, pattern: Patterns.PRICE_USD, message: Messages.invalidPrice },
    ],
  },

  // Product schema
  product: {
    name: [
      { field: 'name', required: true, minLength: 2, maxLength: 100 },
    ],
    code: [
      { field: 'code', required: true, pattern: Patterns.PRODUCT_CODE, message: Messages.invalidProductCode },
    ],
    barcode: [
      { field: 'barcode', pattern: Patterns.BARCODE, message: Messages.invalidBarcode },
    ],
    pricePerBag: [
      { field: 'pricePerBag', required: true, min: 0, pattern: Patterns.PRICE_UZS, message: Messages.invalidPrice },
    ],
    unitsPerBag: [
      { field: 'unitsPerBag', required: true, min: 1, max: 10000 },
    ],
    stock: [
      { field: 'stock', min: 0, max: 1000000 },
    ],
    warehouse: [
      { field: 'warehouse', required: true },
    ],
  },

  // Sale schema
  sale: {
    customerId: [
      { field: 'customerId', required: true },
    ],
    items: [
      { 
        field: 'items', 
        required: true,
        custom: (items: any[]) => {
          if (!Array.isArray(items) || items.length === 0) {
            return 'Kamida bitta mahsulot tanlanishi kerak';
          }
          return null;
        }
      },
    ],
    totalAmount: [
      { field: 'totalAmount', required: true, min: 0, pattern: Patterns.PRICE_UZS },
    ],
    paidAmount: [
      { field: 'paidAmount', min: 0, pattern: Patterns.PRICE_UZS },
    ],
    currency: [
      { field: 'currency', required: true },
    ],
  },

  // User schema
  user: {
    name: [
      { field: 'name', required: true, minLength: 2, maxLength: 50, pattern: Patterns.NAME_UZ },
    ],
    email: [
      { field: 'email', required: true, pattern: Patterns.EMAIL, message: Messages.invalidEmail },
    ],
    phone: [
      { field: 'phone', required: true, pattern: Patterns.PHONE_UZ, message: Messages.invalidPhone },
    ],
    role: [
      { field: 'role', required: true },
    ],
    password: [
      { 
        field: 'password', 
        required: true, 
        minLength: 8,
        custom: (password: string) => {
          if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return Messages.passwordTooWeak;
          }
          return null;
        }
      },
    ],
  },

  // Supplier schema
  supplier: {
    name: [
      { field: 'name', required: true, minLength: 2, maxLength: 100, pattern: Patterns.COMPANY_NAME },
    ],
    phone: [
      { field: 'phone', required: true, pattern: Patterns.PHONE_UZ, message: Messages.invalidPhone },
    ],
    email: [
      { field: 'email', pattern: Patterns.EMAIL, message: Messages.invalidEmail },
    ],
    address: [
      { field: 'address', minLength: 10, maxLength: 200, pattern: Patterns.ADDRESS_UZ },
    ],
    inn: [
      { field: 'inn', pattern: Patterns.INN, message: Messages.invalidINN },
    ],
  },

  // Driver schema
  driver: {
    name: [
      { field: 'name', required: true, minLength: 2, maxLength: 50, pattern: Patterns.NAME_UZ },
    ],
    phone: [
      { field: 'phone', required: true, pattern: Patterns.PHONE_UZ, message: Messages.invalidPhone },
    ],
    licenseNumber: [
      { field: 'licenseNumber', required: true },
    ],
    carPlate: [
      { field: 'carPlate', pattern: Patterns.CAR_PLATE_UZ, message: Messages.invalidCarPlate },
    ],
  },
};

// Register predefined schemas
const validator = ProfessionalValidator.getInstance();
Object.entries(Schemas).forEach(([name, schema]) => {
  validator.registerSchema(name, schema);
});

// Export convenience functions
export const validateCustomer = (data: any) => validator.validate(data, 'customer');
export const validateProduct = (data: any) => validator.validate(data, 'product');
export const validateSale = (data: any) => validator.validate(data, 'sale');
export const validateUser = (data: any) => validator.validate(data, 'user');
export const validateSupplier = (data: any) => validator.validate(data, 'supplier');
export const validateDriver = (data: any) => validator.validate(data, 'driver');

// Export main validator
export default ProfessionalValidator;
