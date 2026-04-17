// Import all workers to initialize them
import './email.worker';
import './telegram.worker';
import './invoice.worker';

import { logger } from '../../utils/logger';

logger.info('✅ All queue workers initialized');
