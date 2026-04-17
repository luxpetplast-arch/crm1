import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validatsiya xatosi',
            details: error.errors,
          }
        });
      }
      next(error);
    }
  };
};

// Common schemas
export const schemas = {
  product: z.object({
    name: z.string().min(1, 'Nomi kiritilishi shart'),
    bagType: z.string().min(1, 'Qop turi kiritilishi shart'),
    unitsPerBag: z.number().positive('Musbat son bo\'lishi kerak'),
    minStockLimit: z.number().min(0),
    optimalStock: z.number().min(0),
    maxCapacity: z.number().positive(),
    pricePerBag: z.number().positive(),
    productionCost: z.number().min(0),
  }),

  customer: z.object({
    name: z.string().min(1, 'Nomi kiritilishi shart'),
    email: z.string().email('Email noto\'g\'ri').optional(),
    phone: z.string().min(1, 'Telefon kiritilishi shart'),
    category: z.enum(['VIP', 'NORMAL', 'RISK']).optional(),
  }),

  sale: z.object({
    customerId: z.string().uuid().optional(),
    items: z.array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().positive(),
        pricePerBag: z.number().positive(),
        saleType: z.enum(['bag', 'piece']).optional(),
      })
    ).min(1, 'Kamida bitta mahsulot bo\'lishi kerak'),
    totalAmount: z.number().positive(),
    paidAmount: z.number().min(0),
    currency: z.enum(['UZS', 'USD', 'EUR']).default('USD'),
    paymentDetails: z.object({
      uzs: z.number().optional(),
      usd: z.number().optional(),
      click: z.number().optional(),
    }).optional(),
    driverId: z.string().uuid().optional(),
    isKocha: z.boolean().optional(),
    manualCustomerName: z.string().optional(),
    manualCustomerPhone: z.string().optional(),
  }),

  expense: z.object({
    category: z.enum(['SALARY', 'ELECTRICITY', 'RAW_MATERIALS', 'TRANSPORT', 'TAX', 'OTHER']),
    amount: z.number().positive(),
    currency: z.enum(['UZS', 'USD', 'EUR']),
    description: z.string().min(1),
  }),
};
