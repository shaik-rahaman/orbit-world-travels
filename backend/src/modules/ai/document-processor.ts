import * as fs from 'fs';
import * as path from 'path';
import { callGroqAPIWithJSON } from '@/services/groq.service';
import { EXTRACTION_PROMPTS } from './prompts';

import pdfParse from 'pdf-parse';

export type ModuleType = 'VISA' | 'FLIGHT' | 'HOTEL' | 'INSURANCE' | 'INVOICE';

export interface ExtractedData {
  moduleType: ModuleType;
  data: Record<string, any>;
  confidence: number;
  rawText: string;
}

/**
 * Document processor service
 * Handles file uploads and AI-based data extraction
 */
export class DocumentProcessor {
  /**
   * Extract text from PDF file
   */
  static async extractPDFText(filePath: string): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(fileBuffer);
      return pdfData.text;
    } catch (error) {
      console.warn('PDF extraction error, falling back to empty text:', error);
      // Don't throw — return empty string so higher-level processing can attempt heuristics
      return '';
    }
  }

  /**
   * Extract text from image file (base64)
   */
  static async extractImageText(filePath: string): Promise<string> {
    // In production, use OCR service like Google Vision API
    // For now, we'll read the file and pass to LLM
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const base64 = fileBuffer.toString('base64');
      // This would normally go to LLM with vision capabilities
      // For now, return base64 as placeholder
      return `[Image: ${path.basename(filePath)}]`;
    } catch (error) {
      console.error('Image extraction error:', error);
      throw new Error(
        `Failed to extract image text: ${(error as Error).message}`
      );
    }
  }

  /**
   * Extract text from plain text file
   */
  static async extractTextFile(filePath: string): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      return fileBuffer.toString('utf-8');
    } catch (error) {
      console.error('Text file extraction error:', error);
      throw new Error(
        `Failed to extract text file: ${(error as Error).message}`
      );
    }
  }

  /**
   * Process uploaded file and extract structured data
   */
  static async processFile(
    filePath: string,
    moduleType: ModuleType,
    clientId?: string
  ): Promise<ExtractedData> {
    try {
      const ext = path.extname(filePath).toLowerCase();
      let extractedText = '';

      // Extract text from file based on type
      if (ext === '.pdf') {
        extractedText = await this.extractPDFText(filePath);
      } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        extractedText = await this.extractImageText(filePath);
      } else if (['.txt', '.doc', '.docx'].includes(ext)) {
        extractedText = await this.extractTextFile(filePath);
      } else {
        throw new Error(`Unsupported file type: ${ext}`);
      }

      // Get extraction prompt for module type
      const prompt =
        EXTRACTION_PROMPTS[moduleType.toLowerCase() as keyof typeof EXTRACTION_PROMPTS];

      if (!prompt) {
        throw new Error(`No extraction prompt for module: ${moduleType}`);
      }

      // Prepare full prompt with document text
      const fullPrompt = `${prompt}\n\nDocument Content:\n${extractedText}`;

      // Call Groq LLM for extraction. If Groq fails (network/key), fall back to a simple heuristic
      let extractedData: Record<string, any> = {};
      try {
        const extractedDataRaw = await callGroqAPIWithJSON(fullPrompt);
        extractedData = (extractedDataRaw || {}) as Record<string, any>;
      } catch (err) {
        console.warn('Groq extraction failed, falling back to heuristic extraction', err);

        // Heuristic fallback: try to find monetary values in the text
        const amounts: number[] = [];
        const amountRegex = /₹?[\d,]+\.?\d*/g;
        const matches = extractedText.match(amountRegex) || [];
        for (const m of matches) {
          const cleaned = m.replace(/[₹,]/g, '');
          const num = parseFloat(cleaned);
          if (!isNaN(num) && num > 0) amounts.push(num);
        }

        const customerAmount = amounts.length > 0 ? amounts[amounts.length - 1] : 0;
        const vendorCost = amounts.length > 1 ? amounts[amounts.length - 2] : 0;

        // Extract airline if present (for flight module)
        let airline = '';
        const airlineMatch = extractedText.match(/airline[:\s]+(\w+)/i) || extractedText.match(/(IndiGo|Air India|Emirates|Jet Airways)/i);
        if (airlineMatch) airline = airlineMatch[1] || '';

        extractedData = {
          airline: airline,
          flightNumber: '',
          pnr: '',
          passengerName: '',
          sector: '',
          applicantName: '',
          country: '',
          visaType: '',
          hotelName: '',
          checkInDate: '',
          checkOutDate: '',
          city: '',
          policyNumber: '',
          policyType: '',
          insuredName: '',
          vendorCost,
          customerAmount,
          status: 'PENDING',
        };
      }

      // Calculate confidence based on data completeness
      const confidence = this.calculateConfidence(extractedData);

      // Coerce numeric financial fields to numbers when possible
      if (extractedData.vendorCost !== undefined && typeof extractedData.vendorCost !== 'number') {
        const v = parseFloat(String(extractedData.vendorCost).replace(/[₹,]/g, ''));
        extractedData.vendorCost = isNaN(v) ? extractedData.vendorCost : v;
      }
      if (extractedData.customerAmount !== undefined && typeof extractedData.customerAmount !== 'number') {
        const c = parseFloat(String(extractedData.customerAmount).replace(/[₹,]/g, ''));
        extractedData.customerAmount = isNaN(c) ? extractedData.customerAmount : c;
      }

      return {
        moduleType,
        data: extractedData,
        confidence,
        rawText: extractedText,
      };
    } catch (error) {
      console.error('Document processing error:', error);
      throw error;
    }
  }

  /**
   * Calculate confidence score based on extracted data
   */
  private static calculateConfidence(data: Record<string, any>): number {
    const requiredFields = [
      'vendorCost',
      'customerAmount',
    ];

    let filledFields = 0;
    let totalFields = Object.keys(data).length;

    for (const field of Object.keys(data)) {
      if (data[field] !== null && data[field] !== undefined && data[field] !== '') {
        filledFields++;
      }
    }

    // If all required financial fields are present
    const hasFinancialData = requiredFields.every((field) => data[field] !== undefined);

    let confidence = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;

    if (hasFinancialData) {
      confidence = Math.min(confidence + 10, 100);
    }

    return Math.round(confidence);
  }

  /**
   * Validate extracted data
   */
  static validateExtractedData(data: ExtractedData): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const extractedData = data.data;

    // Check required fields based on module type
    switch (data.moduleType) {
      case 'FLIGHT':
        if (!extractedData.airline) errors.push('Airline is required');
        // Require either flight number or PNR
        if (!extractedData.flightNumber && !extractedData.pnr) errors.push('Flight number or PNR is required');
        if (!extractedData.passengerName) errors.push('Passenger name is required');
        break;

      case 'VISA':
        if (!extractedData.applicantName) errors.push('Applicant name is required');
        if (!extractedData.country) errors.push('Country is required');
        break;

      case 'HOTEL':
        if (!extractedData.hotelName) errors.push('Hotel name is required');
        if (!extractedData.checkInDate) errors.push('Check-in date is required');
        if (!extractedData.checkOutDate) errors.push('Check-out date is required');
        break;

      case 'INSURANCE':
        if (!extractedData.policyNumber) errors.push('Policy number is required');
        if (!extractedData.policyType) errors.push('Policy type is required');
        break;
    }

    // Validate financial data
    if (typeof extractedData.vendorCost !== 'number' || extractedData.vendorCost < 0) {
      errors.push('Vendor cost must be a positive number');
    }
    if (typeof extractedData.customerAmount !== 'number' || extractedData.customerAmount < 0) {
      errors.push('Customer amount must be a positive number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Enrich extracted data with calculated fields
   */
  static enrichExtractedData(data: Record<string, any>): Record<string, any> {
    const enriched = { ...data };

    // Calculate margin if vendorCost and customerAmount exist
    if (enriched.vendorCost !== undefined && enriched.customerAmount !== undefined) {
      enriched.margin =
        Number(enriched.customerAmount) - Number(enriched.vendorCost);
    }

    // Set default status for visas
    if (enriched.status === undefined) {
      enriched.status = 'PENDING';
    }

    // Use flightNumber or PNR for flightNumber if not set
    if (!enriched.flightNumber && enriched.pnr) {
      enriched.flightNumber = enriched.pnr;
    }

    return enriched;
  }

  /**
   * Clean up temporary file
   */
  static async cleanupFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn('Failed to cleanup file:', error);
    }
  }
}
