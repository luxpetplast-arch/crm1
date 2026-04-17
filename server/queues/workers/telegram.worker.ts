import { Worker, Job } from 'bullmq';
import { connection } from '../config';
import { botManager } from '../../bot/bot-manager';
import { logger } from '../../utils/logger';

export const telegramWorker = new Worker(
  'telegram',
  async (job: Job) => {
    const { chatId, message, options } = job.data;
    
    logger.info({ jobId: job.id, chatId }, 'Processing telegram job');
    
    await botManager.sendMessage(chatId, message, options);
    
    return { sent: true };
  },
  {
    connection,
    concurrency: 10,
  }
);

telegramWorker.on('completed', (job: Job) => {
  logger.info({ jobId: job.id }, 'Telegram job completed');
});

telegramWorker.on('failed', (job: Job | undefined, err: Error) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Telegram job failed');
});
