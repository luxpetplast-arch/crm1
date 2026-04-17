import { Worker, Job } from 'bullmq';
import { connection } from '../config';
import { logger } from '../../utils/logger';

export const emailWorker = new Worker(
  'email',
  async (job: Job) => {
    const { to, subject, body } = job.data;
    
    logger.info({ jobId: job.id, to }, 'Processing email job');
    
    // Email yuborish logikasi (nodemailer yoki boshqa service)
    // await sendEmail({ to, subject, html: body });
    
    await new Promise(resolve => setTimeout(resolve, 100)); // Mock
    
    return { sent: true, timestamp: new Date().toISOString() };
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 100,
      duration: 3600000,
    },
  }
);

emailWorker.on('completed', (job: Job) => {
  logger.info({ jobId: job.id }, 'Email job completed');
});

emailWorker.on('failed', (job: Job | undefined, err: Error) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Email job failed');
});
