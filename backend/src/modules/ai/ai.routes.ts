import { Router, Request, Response } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { uploadDocumentMiddleware } from '@/middleware/upload';
import {
  extractDocumentSchema,
  chatbotQuerySchema,
} from '@/shared/dtos/ai.dto';
import { AIController } from './ai.controller';

const router = Router();

/**
 * AI routes
 */

// Extract document with AI
router.post(
  '/extract',
  authMiddleware,
  uploadDocumentMiddleware,
  validateRequest(extractDocumentSchema, 'body'),
  AIController.extractDocument
);

// Chatbot query
router.post(
  '/chat',
  authMiddleware,
  validateRequest(chatbotQuerySchema, 'body'),
  AIController.chat
);

// Get chatbot examples
router.get('/chat/examples', authMiddleware, AIController.getChatExamples);

// Get available metrics
router.get('/chat/metrics', authMiddleware, AIController.getMetrics);

export default router;
