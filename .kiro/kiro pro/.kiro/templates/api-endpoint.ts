import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Request validation schema
const {{EndpointName}}Schema = z.object({
  // Define schema
});

type {{EndpointName}}Request = z.infer<typeof {{EndpointName}}Schema>;

/**
 * {{EndpointName}} endpoint
 * 
 * @route {{METHOD}} /api/{{route}}
 * @access {{Public/Private}}
 * @description {{Description}}
 */
export const {{endpointName}} = async (
  req: Request<{}, {}, {{EndpointName}}Request>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request
    const data = {{EndpointName}}Schema.parse(req.body);
    
    // Business logic
    
    // Response
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
