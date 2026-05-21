import Joi from 'joi';
import { Types } from 'mongoose';

const objectIdValidator = () =>
  Joi.string()
    .custom((value, helpers) => {
      if (!Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'any.invalid': 'Invalid client ID format',
    });

export const createVisaSchema = Joi.object({
  applicantName: Joi.string().required().min(2).max(100),
  country: Joi.string().required(),
  passportNumber: Joi.string().required(),
  visaType: Joi.string().required(),
  vendorCost: Joi.number().positive().required(),
  customerAmount: Joi.number().positive().required(),
  clientId: objectIdValidator().required(),
  notes: Joi.string().optional(),
});

export const updateVisaSchema = Joi.object({
  applicantName: Joi.string().min(2).max(100),
  country: Joi.string(),
  visaType: Joi.string(),
  status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'),
  vendorCost: Joi.number().positive(),
  customerAmount: Joi.number().positive(),
  clientId: objectIdValidator().optional(),
  notes: Joi.string().optional(),
});

export interface CreateVisaDTO {
  applicantName: string;
  country: string;
  passportNumber: string;
  visaType: string;
  vendorCost: number;
  customerAmount: number;
  clientId: string;
  notes?: string;
}

export interface UpdateVisaDTO {
  applicantName?: string;
  country?: string;
  passportNumber?: string;
  visaType?: string;
  status?: string;
  vendorCost?: number;
  customerAmount?: number;
  clientId?: string;
  notes?: string;
}

export interface VisaResponseDTO {
  id: string;
  applicantName: string;
  country: string;
  visaType: string;
  status: string;
  vendorCost: number;
  customerAmount: number;
  margin: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
