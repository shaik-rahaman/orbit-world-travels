import Joi from 'joi';

export const createInsuranceSchema = Joi.object({
  policyNumber: Joi.string().required(),
  insuredName: Joi.string().required().min(2).max(100),
  policyType: Joi.string().required(),
  coverageAmount: Joi.number().positive().required(),
  vendorCost: Joi.number().positive().required(),
  customerAmount: Joi.number().positive().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  clientId: Joi.string().optional(),
  notes: Joi.string().optional(),
});

export const updateInsuranceSchema = Joi.object({
  policyNumber: Joi.string(),
  insuredName: Joi.string().min(2).max(100),
  policyType: Joi.string(),
  coverageAmount: Joi.number().positive(),
  vendorCost: Joi.number().positive(),
  customerAmount: Joi.number().positive(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  clientId: Joi.string().optional(),
  notes: Joi.string().optional(),
});

export interface CreateInsuranceDTO {
  policyNumber: string;
  insuredName: string;
  policyType: string;
  coverageAmount: number;
  vendorCost: number;
  customerAmount: number;
  startDate: Date;
  endDate: Date;
  clientId?: string;
  notes?: string;
}

export interface UpdateInsuranceDTO {
  policyNumber?: string;
  insuredName?: string;
  policyType?: string;
  coverageAmount?: number;
  vendorCost?: number;
  customerAmount?: number;
  startDate?: Date;
  endDate?: Date;
  clientId?: string;
  notes?: string;
}

export interface InsuranceResponseDTO {
  id: string;
  policyNumber: string;
  insuredName: string;
  policyType: string;
  coverageAmount: number;
  vendorCost: number;
  customerAmount: number;
  margin: number;
  startDate: Date;
  endDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
