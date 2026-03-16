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
          error: 'Validatsiya xatosi',
          details: error.errors,
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
    customerId: z.string().uuid(),
    currency: z.enum(['UZS', 'USD', 'CLICK']),
    items: z.array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().positive(),
        pricePerBag: z.number().positive(),
      })
    ).min(1, 'Kamida bitta mahsulot bo\'lishi kerak'),
  }),

  expense: z.object({
    category: z.enum(['SALARY', 'ELECTRICITY', 'RAW_MATERIALS', 'TRANSPORT', 'TAX', 'OTHER']),
    amount: z.number().positive(),
    currency: z.enum(['UZS', 'USD', 'CLICK']),
    description: z.string().min(1),
  }),
};
