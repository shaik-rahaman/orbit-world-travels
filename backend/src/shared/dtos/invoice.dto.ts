import Joi from 'joi';

export const createInvoiceSchema = Joi.object({
  financialYear: Joi.number().required().messages({
    'number.base': 'Financial year must be a number',
    'any.required': 'Financial year is required',
  }),
  clientId: Joi.string().optional().messages({
    'string.base': 'Client ID must be a valid string',
  }),
  notes: Joi.string().optional().messages({
    'string.base': 'Notes must be a string',
  }),
});

export const finalizeInvoiceSchema = Joi.object({
  invoiceId: Joi.string().required(),
});

export interface CreateInvoiceDTO {
  financialYear: number;
  clientId?: string;
  notes?: string;
}

export interface FinalizeInvoiceDTO {
  invoiceId: string;
}

export interface InvoiceItemInput {
  moduleType: 'VISA' | 'FLIGHT' | 'HOTEL' | 'INSURANCE';
  referenceId: string;
  description?: string;
}

export interface InvoiceResponseDTO {
  id: string;
  invoiceNumber: string;
  financialYear: number;
  status: string;
  totalVendorCost: number;
  totalCustomerAmount: number;
  totalMargin: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  invoiceItems: InvoiceItemDTO[];
}

export interface InvoiceItemDTO {
  id: string;
  moduleType: string;
  referenceId: string;
  vendorCost: number;
  customerAmount: number;
  margin: number;
  description?: string;
}
