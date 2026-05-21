import Joi from 'joi';
import { Types } from 'mongoose';

/**
 * Document extraction DTOs
 */

export interface ExtractDocumentDTO {
  moduleType: 'VISA' | 'FLIGHT' | 'HOTEL' | 'INSURANCE' | 'INVOICE';
  clientId?: string;
}

export interface ExtractDocumentResponseDTO {
  success: boolean;
  moduleType: string;
  data?: Record<string, any>;
  confidence: number;
  status: 'success' | 'warning' | 'error';
  message: string;
}

export interface ChatbotQueryDTO {
  question: string;
}

export interface ChatbotResponseDTO {
  answer: string;
  data?: any[];
  query?: string;
  executionTime: number;
  confidence: number;
}

/**
 * Custom MongoDB ObjectId validator
 */
const objectIdValidator = () =>
  Joi.string()
    .custom((value, helpers) => {
      if (!Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'any.invalid': 'Invalid client ID format. Please select a valid client from the dropdown.',
    });

/**
 * Joi validation schemas
 */

export const extractDocumentSchema = Joi.object({
  moduleType: Joi.string()
    .valid('VISA', 'FLIGHT', 'HOTEL', 'INSURANCE', 'INVOICE')
    .required(),
  // clientId is optional for uploads (PDF/image); when provided it must be a valid MongoDB ObjectId
  clientId: objectIdValidator().optional(),
});

export const chatbotQuerySchema = Joi.object({
  question: Joi.string().min(1).max(1000).required(),
})
  .rename('query', 'question', { ignoreUndefined: true, override: true })
  .rename('message', 'question', { ignoreUndefined: true, override: true });
// Accepts payloads with `query` or `message` and normalizes to `question`
