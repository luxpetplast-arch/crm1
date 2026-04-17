import { prisma } from './prisma';

export async function createAuditLog(
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  changes?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        changes,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

export function auditMiddleware(entity: string) {
  return async (req: any, res: any, next: any) => {
    const originalJson = res.json.bind(res);
    
    res.json = function (data: any) {
      if (req.user && req.method !== 'GET') {
        const action = `${req.method} ${req.path}`;
        const entityId = req.params.id || data?.id || 'unknown';
        
        createAuditLog(req.user.id, action, entity, entityId, {
          method: req.method,
          body: req.body,
          params: req.params,
        });
      }
      
      return originalJson(data);
    };
    
    next();
  };
}
