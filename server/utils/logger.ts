import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  
  transport: isProduction ? undefined : {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  },

  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  },

  redact: {
    paths: [
      'password',
      'token',
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.token',
    ],
    remove: true,
  },
});

export const getRequestLogger = (req: any) => {
  return logger.child({
    requestId: req.id,
    userId: req.user?.id,
    ip: req.ip,
    method: req.method,
    path: req.path,
  });
};
