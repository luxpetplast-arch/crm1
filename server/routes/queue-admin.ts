import { Router } from 'express';
import { queues, addJob } from '../queues/config';
import { authorize } from '../middleware/auth';
import { ResponseHelper } from '../utils/response';

const router = Router();

// Queue status olish (Admin only)
router.get('/status', authorize('ADMIN'), async (req, res) => {
  const status = await Promise.all(
    Object.entries(queues).map(async ([name, queue]) => {
      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
      ]);

      return {
        name,
        counts: { waiting, active, completed, failed },
      };
    })
  );

  res.json(ResponseHelper.success(status));
});

// Failed joblarni qayta ishlash
router.post('/retry/:queueName', authorize('ADMIN'), async (req, res) => {
  const { queueName } = req.params;
  const queue = queues[queueName as keyof typeof queues];
  
  if (!queue) {
    return res.status(404).json(ResponseHelper.notFound('Queue'));
  }

  const failedJobs = await queue.getFailed();
  
  await Promise.all(
    failedJobs.map(job => job.retry())
  );

  res.json(ResponseHelper.success({
    retried: failedJobs.length,
  }));
});

// Job ni o'chirish
router.delete('/jobs/:queueName/:jobId', authorize('ADMIN'), async (req, res) => {
  const { queueName, jobId } = req.params;
  const queue = queues[queueName as keyof typeof queues];
  
  const job = await queue.getJob(jobId);
  if (!job) {
    return res.status(404).json(ResponseHelper.notFound('Job'));
  }

  await job.remove();
  res.json(ResponseHelper.success({ removed: true }));
});

// Yangi job qo'shish (test/debug uchun)
router.post('/jobs/:queueName', authorize('ADMIN'), async (req, res) => {
  const { queueName } = req.params;
  const { type, data, options } = req.body;
  
  const job = await addJob(
    queueName as keyof typeof queues,
    type,
    data,
    options
  );

  res.status(201).json(ResponseHelper.success({ jobId: job.id }));
});

export default router;
