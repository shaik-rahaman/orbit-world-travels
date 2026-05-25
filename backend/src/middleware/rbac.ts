import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { ForbiddenException } from '@/shared/exceptions';
import { Logger } from '@/shared/utils/response';

/**
 * RBAC Middleware - Restricts write operations for DEMO role
 * Allows: GET, HEAD, OPTIONS
 * Blocks: POST, PUT, PATCH, DELETE for DEMO users
 */
export const readOnlyMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRole = req.user?.role;
    const method = req.method.toUpperCase();

    // Restrict write operations for DEMO users
    if (userRole === 'DEMO' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      Logger.warn(`[RBAC] Demo user ${req.user?.email} attempted ${method} operation`, {
        path: req.path,
        method,
        email: req.user?.email,
      });
      throw new ForbiddenException('Demo users have read-only access');
    }

    next();
  } catch (error) {
    if (error instanceof ForbiddenException) {
      return res.status(403).json({
        success: false,
        error: {
          message: error.message,
          code: error.errorCode,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(403).json({
      success: false,
      error: {
        message: 'Access forbidden',
        code: 'FORBIDDEN',
      },
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Role-based access control - Only allow specific roles
 */
export const roleBasedMiddleware = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role;

      if (!userRole || !allowedRoles.includes(userRole)) {
        Logger.warn(`[RBAC] User ${req.user?.email} with role ${userRole} denied access`, {
          path: req.path,
          method: req.method,
          allowedRoles,
          userRole,
        });
        throw new ForbiddenException(
          `This action requires one of the following roles: ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      if (error instanceof ForbiddenException) {
        return res.status(403).json({
          success: false,
          error: {
            message: error.message,
            code: error.errorCode,
          },
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(403).json({
        success: false,
        error: {
          message: 'Access forbidden',
          code: 'FORBIDDEN',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };
};

/**
 * Non-demo middleware - Blocks DEMO role access
 */
export const nonDemoMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRole = req.user?.role;

    if (userRole === 'DEMO') {
      Logger.warn(`[RBAC] Demo user ${req.user?.email} denied access to restricted endpoint`, {
        path: req.path,
        method: req.method,
      });
      throw new ForbiddenException('This action is not available for demo users');
    }

    next();
  } catch (error) {
    if (error instanceof ForbiddenException) {
      return res.status(403).json({
        success: false,
        error: {
          message: error.message,
          code: error.errorCode,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(403).json({
      success: false,
      error: {
        message: 'Access forbidden',
        code: 'FORBIDDEN',
      },
      timestamp: new Date().toISOString(),
    });
  }
};
