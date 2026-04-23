import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Zod schema validation middleware
 */
export function validateRequest(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}

/**
 * Query params validation
 */
export function validateQuery(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: error.errors
        });
      }
      next(error);
    }
  };
}

// ==================== SCHEMAS ====================

/**
 * Sale yaratish uchun schema
 */
export const CreateSaleSchema = z.object({
  customerId: z.string().uuid().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive('Miqdor musbat bo\'lishi kerak'),
    pricePerBag: z.number().nonnegative('Narx manfiy bo\'lmasligi kerak').optional(),
    pricePerPiece: z.number().nonnegative().optional(),
    saleType: z.enum(['bag', 'piece']).optional(),
    unitsPerBag: z.number().positive().optional()
  })).min(1, 'Kamida bitta mahsulot tanlash kerak'),
  totalAmount: z.number().positive('Umumiy summa musbat bo\'lishi kerak'),
  paidAmount: z.number().nonnegative('To\'lov summasi manfiy bo\'lmasligi kerak'),
  currency: z.enum(['USD', 'UZS']),
  paymentStatus: z.enum(['PAID', 'UNPAID', 'PARTIAL']).optional(),
  paymentDetails: z.any().optional(),
  driverId: z.string().uuid().optional(),
  factoryShare: z.number().nonnegative().optional(),
  customerShare: z.number().nonnegative().optional(),
  isKocha: z.boolean().optional(),
  manualCustomerName: z.string().optional(),
  manualCustomerPhone: z.string().optional()
});

/**
 * Order yaratish uchun schema
 */
export const CreateOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    pricePerBag: z.number().nonnegative().optional()
  })).min(1),
  totalAmount: z.number().positive(),
  paidAmount: z.number().nonnegative(),
  currency: z.enum(['USD', 'UZS']),
  paymentStatus: z.enum(['PAID', 'UNPAID', 'PARTIAL']).optional(),
  deliveryDate: z.string().datetime().optional(),
  notes: z.string().optional()
});

/**
 * Customer yaratish uchun schema
 */
export const CreateCustomerSchema = z.object({
  name: z.string().min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak'),
  phone: z.string().regex(/^\+?[0-9]{9,15}$/, 'Telefon raqam noto\'g\'ri formatda'),
  address: z.string().optional(),
  telegramChatId: z.string().optional(),
  priceType: z.enum(['FACTORY', 'DEALER', 'RETAIL']).optional(),
  productPrices: z.any().optional()
});

/**
 * Product yaratish uchun schema
 */
export const CreateProductSchema = z.object({
  name: z.string().min(2),
  category: z.string().optional(),
  type: z.string().optional(),
  currentStock: z.number().nonnegative(),
  currentUnits: z.number().nonnegative().optional(),
  unitsPerBag: z.number().positive().optional(),
  minStock: z.number().nonnegative().optional(),
  factoryPrice: z.number().nonnegative(),
  dealerPrice: z.number().nonnegative().optional(),
  retailPrice: z.number().nonnegative().optional(),
  factoryPriceUZS: z.number().nonnegative().optional(),
  dealerPriceUZS: z.number().nonnegative().optional(),
  retailPriceUZS: z.number().nonnegative().optional()
});

/**
 * Login schema
 */
export const LoginSchema = z.object({
  email: z.string().email('Email noto\'g\'ri formatda'),
  password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak')
});

/**
 * Register schema
 */
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak')
    .regex(/[A-Z]/, 'Parolda kamida bitta katta harf bo\'lishi kerak')
    .regex(/[a-z]/, 'Parolda kamida bitta kichik harf bo\'lishi kerak')
    .regex(/[0-9]/, 'Parolda kamida bitta raqam bo\'lishi kerak'),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'CASHIER', 'SELLER', 'DRIVER']).optional()
});

/**
 * UUID validation
 */
export const UUIDSchema = z.string().uuid('Noto\'g\'ri ID format');

/**
 * Pagination schema
 */
export const PaginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});
