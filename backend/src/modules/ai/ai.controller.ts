import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
import { ValidatedRequest } from '@/middleware/validation';
import { DocumentProcessor } from './document-processor';
import { ChatbotService } from './chatbot.service';
import { AIRepository } from './ai.repository';
import { ApiResponseBuilder } from '@/shared/utils/response';
import { BadRequestException } from '@/shared/exceptions';
import { config } from '@/config/env';
import * as fs from 'fs';
import * as path from 'path';

/**
 * AI controller
 */
export class AIController {
  /**
   * Extract data from uploaded document
   */
  static async extractDocument(req: AuthenticatedRequest & ValidatedRequest, res: Response): Promise<void> {
    try {
      const { moduleType, clientId } = req.validated;
      const file = (req as any).file;
      const userId = req.user!.id;

      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Validate file type
      const allowedMimes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
      ];
      if (!allowedMimes.includes(file.mimetype)) {
        await DocumentProcessor.cleanupFile(file.path);
        throw new BadRequestException(
          'Invalid file type. Only PDF and images allowed'
        );
      }

      // Process document
      const extractedData = await DocumentProcessor.processFile(
        file.path,
        moduleType,
        clientId
      );

      // Validate extracted data (don't block saving — we'll persist partial data and return warnings)
      const validation = DocumentProcessor.validateExtractedData(extractedData);
      const validationErrors = validation.valid ? [] : validation.errors;

      // Enrich data
      const enrichedData = DocumentProcessor.enrichExtractedData(
        extractedData.data
      );

      // Save to database (AIRepository now uses safe defaults for missing fields)
      const savedRecord = await AIRepository.saveExtractedData(
        {
          ...extractedData,
          data: enrichedData,
        },
        clientId,
        userId
      );

      // Cleanup temp file
      await DocumentProcessor.cleanupFile(file.path);

      if (savedRecord.status === 'error') {
        res.status(400).json(ApiResponseBuilder.error(savedRecord.message));
        return;
      }

      // Include any validation warnings in the success response
      res.status(201).json(
        ApiResponseBuilder.success(
          {
            moduleType: savedRecord.moduleType,
            recordId: savedRecord.data?.id,
            confidence: savedRecord.confidence,
            status: savedRecord.status,
            message: savedRecord.message,
            data: savedRecord.data,
            validationErrors: validationErrors,
          },
          validationErrors.length > 0 ? 'Document processed with warnings' : 'Document processed and data extracted successfully'
        )
      );
    } catch (error) {
      // Cleanup on error
      if ((req.file as any)?.path) {
        await DocumentProcessor.cleanupFile((req.file as any).path);
      }
      throw error;
    }
  }

  /**
   * Chat with AI chatbot
   */
  static async chat(req: AuthenticatedRequest & ValidatedRequest, res: Response): Promise<void> {
    try {
      // Log incoming request for debugging
      console.log('[AIController.chat] incoming request', {
        userId: req.user?.id,
        body: req.body,
        validated: req.validated,
        timestamp: new Date().toISOString(),
      });

      const { question } = req.validated;
      const userId = req.user!.id;

      console.log('[AIController.chat] processing question', {
        userId,
        question,
        timestamp: new Date().toISOString(),
      });

      // Validate Groq API key
      if (!config.groq.apiKey) {
        console.warn('[AIController.chat] Groq API not configured');
        throw new BadRequestException(
          'Groq API not configured. Contact administrator.'
        );
      }

      // Process question with searchMode
      const response = await ChatbotService.processQuestion({
        userId,
        question,
        searchMode: req.body.searchMode || 'hybrid',
      });

      // Log response for debugging
      console.log('[AIController.chat] response generated', {
        userId,
        question,
        searchMode: req.body.searchMode || 'hybrid',
        responseAnswer: response.answer,
        responseDataLength: response.data?.length || 0,
        executionTime: response.executionTime,
        confidence: response.confidence,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json(
        ApiResponseBuilder.success(response, 'Query processed successfully')
      );
    } catch (error) {
      console.error('[AIController.chat] error occurred', {
        error: (error as any).message || error,
        stack: (error as any).stack,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Get example chatbot questions
   */
  static async getChatExamples(req: Request, res: Response): Promise<void> {
    try {
      const examples = ChatbotService.getExampleQuestions();

      res.status(200).json(
        ApiResponseBuilder.success(examples, 'Example questions retrieved')
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available metrics for queries
   */
  static async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = ChatbotService.getAvailableMetrics();

      res.status(200).json(
        ApiResponseBuilder.success(metrics, 'Available metrics retrieved')
      );
    } catch (error) {
      throw error;
    }
  }
}
