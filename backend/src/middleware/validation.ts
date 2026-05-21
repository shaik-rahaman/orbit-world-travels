import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationException } from '@/shared/exceptions';

export interface ValidatedRequest extends Request {
  validated?: any;
}

export const validateRequest =
  (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') =>
  (req: ValidatedRequest, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errors: Record<string, string[]> = {};
        error.details.forEach((detail) => {
          const key = detail.path.join('.');
          if (!errors[key]) {
            errors[key] = [];
          }
          errors[key].push(detail.message);
        });

        throw new ValidationException(errors, 'Validation failed');
      }

      req.validated = value;
      next();
    } catch (err) {
      next(err);
    }
  };
