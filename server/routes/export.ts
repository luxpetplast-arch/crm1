import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  exportProducts, 
  exportCustomers, 
  getExportStatistics,
  sendExportResponse,
  ExportOptions 
} from '../utils/export-utils';

const router = express.Router();

// Mahsulotlarni eksport qilish
router.get('/products', authenticate, async (req: any, res) => {
  try {
    // Faqat admin va managerlar eksport qilishi mumkin
    if (!['ADMIN', 'MANAGER', 'SELLER'].includes(req.user?.role)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const options: ExportOptions = {
      format: (req.query.format as 'json' | 'excel' | 'csv') || 'json',
      includeRelations: req.query.includeRelations === 'true',
      filters: {
        status: req.query.status as string,
        category: req.query.category as string,
        minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined
      }
    };

    // Sana oralig'i
    if (req.query.startDate && req.query.endDate) {
      options.dateRange = {
        start: new Date(req.query.startDate as string),
        end: new Date(req.query.endDate as string)
      };
    }

    const result = await exportProducts(options);
    sendExportResponse(res, result, options.format!);

  } catch (error) {
    console.error('Mahsulot eksport xatolik:', error);
    res.status(500).json({ error: 'Mahsulotlarni eksport qilishda xatolik' });
  }
});

// Mijozlarni eksport qilish
router.get('/customers', authenticate, async (req: any, res) => {
  try {
    // Faqat admin va managerlar eksport qilishi mumkin
    if (!['ADMIN', 'MANAGER', 'SELLER'].includes(req.user?.role)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const options: ExportOptions = {
      format: (req.query.format as 'json' | 'excel' | 'csv') || 'json',
      includeRelations: req.query.includeRelations === 'true',
      filters: {
        status: req.query.status as string,
        category: req.query.category as string,
        minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined
      }
    };

    // Sana oralig'i
    if (req.query.startDate && req.query.endDate) {
      options.dateRange = {
        start: new Date(req.query.startDate as string),
        end: new Date(req.query.endDate as string)
      };
    }

    const result = await exportCustomers(options);
    sendExportResponse(res, result, options.format!);

  } catch (error) {
    console.error('Mijoz eksport xatolik:', error);
    res.status(500).json({ error: 'Mijozlarni eksport qilishda xatolik' });
  }
});

// Barcha ma'lumotlarni eksport qilish (mahsulotlar + mijozlar)
router.get('/all', authenticate, async (req: any, res) => {
  try {
    // Faqat adminlar to'liq eksport qilishi mumkin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const format = (req.query.format as 'json' | 'excel' | 'csv') || 'json';
    const includeRelations = req.query.includeRelations === 'true';

    const options: ExportOptions = {
      format,
      includeRelations,
      filters: {
        status: req.query.status as string,
        category: req.query.category as string,
        minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined
      }
    };

    // Sana oralig'i
    if (req.query.startDate && req.query.endDate) {
      options.dateRange = {
        start: new Date(req.query.startDate as string),
        end: new Date(req.query.endDate as string)
      };
    }

    const [productsResult, customersResult] = await Promise.all([
      exportProducts(options),
      exportCustomers(options)
    ]);

    if (format === 'json') {
      const combinedData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        products: typeof productsResult.data === 'string' ? JSON.parse(productsResult.data).products : JSON.parse(productsResult.data.toString()).products,
        customers: typeof customersResult.data === 'string' ? JSON.parse(customersResult.data).customers : JSON.parse(customersResult.data.toString()).customers,
        statistics: await getExportStatistics()
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="barcha_ma-lumotlar_${new Date().toISOString().split('T')[0]}.json"`);
      res.json(combinedData);
    } else {
      // Excel yoki CSV formatida alohida fayllar yuborish
      res.json({
        message: 'Ko\'p fayl formatida eksport',
        products: {
          filename: productsResult.filename,
          downloadUrl: `/api/export/products?format=${format}&includeRelations=${includeRelations}`
        },
        customers: {
          filename: customersResult.filename,
          downloadUrl: `/api/export/customers?format=${format}&includeRelations=${includeRelations}`
        }
      });
    }

  } catch (error) {
    console.error('To\'liq eksport xatolik:', error);
    res.status(500).json({ error: 'Ma\'lumotlarni eksport qilishda xatolik' });
  }
});

// Eksport statistikasi
router.get('/statistics', authenticate, async (req: any, res) => {
  try {
    // Faqat admin va managerlar ko'rishi mumkin
    if (!['ADMIN', 'MANAGER', 'SELLER'].includes(req.user?.role)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const statistics = await getExportStatistics();
    res.json(statistics);

  } catch (error) {
    console.error('Statistika xatolik:', error);
    res.status(500).json({ error: 'Statistikani olishda xatolik' });
  }
});

// Tezkor eksport (presetlar)
router.get('/quick/:type', authenticate, async (req: any, res) => {
  try {
    if (!['ADMIN', 'MANAGER', 'SELLER'].includes(req.user?.role)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const { type } = req.params;
    const format = (req.query.format as 'json' | 'excel' | 'csv') || 'excel';

    let options: ExportOptions = {
      format,
      includeRelations: false
    };

    switch (type) {
      case 'low-stock-products':
        options.filters = { status: 'low_stock' };
        const result1 = await exportProducts(options);
        sendExportResponse(res, result1, format);
        break;

      case 'out-of-stock-products':
        options.filters = { status: 'out_of_stock' };
        const result2 = await exportProducts(options);
        sendExportResponse(res, result2, format);
        break;

      case 'customers-with-debt':
        options.filters = { minAmount: 0.01 };
        const result3 = await exportCustomers(options);
        sendExportResponse(res, result3, format);
        break;

      case 'vip-customers':
        options.filters = { category: 'VIP' };
        const result4 = await exportCustomers(options);
        sendExportResponse(res, result4, format);
        break;

      case 'active-customers':
        options.dateRange = {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        };
        const result5 = await exportCustomers(options);
        sendExportResponse(res, result5, format);
        break;

      default:
        res.status(400).json({ error: 'Noto\'g\'ri eksport turi' });
    }

  } catch (error) {
    console.error('Tezkor eksport xatolik:', error);
    res.status(500).json({ error: 'Tezkor eksportda xatolik' });
  }
});

export default router;
