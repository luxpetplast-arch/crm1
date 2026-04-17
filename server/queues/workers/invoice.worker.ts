import { Worker, Job } from 'bullmq';
import { connection } from '../config';
import { prisma } from '../../utils/prisma';
import { addJob } from '../config';
import { logger } from '../../utils/logger';

export const invoiceWorker = new Worker(
  'invoice',
  async (job: Job) => {
    const { saleId } = job.data;
    
    logger.info({ jobId: job.id, saleId }, 'Generating invoice');
    
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { 
        customer: true, 
        items: { include: { product: true } } 
      },
    });

    if (!sale) {
      throw new Error(`Sale not found: ${saleId}`);
    }

    // Invoice generation logic
    // const invoice = await createInvoiceForSale(saleId);
    
    // Telegram orqali yuborish
    if (sale.customer?.telegramChatId) {
      await addJob('telegram', 'SEND_INVOICE', {
        chatId: sale.customer.telegramChatId,
        // invoiceUrl: invoice.url,
      });
    }

    return { saleId, generated: true };
  },
  {
    connection,
    concurrency: 3,
  }
);

invoiceWorker.on('completed', (job: Job) => {
  logger.info({ jobId: job.id }, 'Invoice job completed');
});

invoiceWorker.on('failed', (job: Job | undefined, err: Error) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Invoice job failed');
});
