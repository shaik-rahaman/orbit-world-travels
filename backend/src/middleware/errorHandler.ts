import { Request, Response, NextFunction } from 'express';
import { AppException, ValidationException } from '@/shared/exceptions';
import { Logger } from '@/shared/utils';

export const errorHandlerMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Logger.error('Error occurred', error);

  if (error instanceof ValidationException) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.errorCode,
        errors: error.errors,
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }

  if (error instanceof AppException) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.errorCode,
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }

  // Unhandled errors
  const response: any = {
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  if (process.env.NODE_ENV !== 'production') {
    response.error.details = error && (error.stack || error.message || error);
  }

  return res.status(500).json(response);
};
