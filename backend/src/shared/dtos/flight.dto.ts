import Joi from 'joi';

export const createFlightSchema = Joi.object({
  airline: Joi.string().required(),
  flightNumber: Joi.string().required(),
  pnr: Joi.string().required(),
  sector: Joi.string().required(),
  passengerName: Joi.string().required().min(2).max(100),
  vendorCost: Joi.number().positive().required(),
  customerAmount: Joi.number().positive().required(),
  departureDate: Joi.date().iso().optional(),
  returnDate: Joi.date().iso().optional(),
  clientId: Joi.string().optional(),
  notes: Joi.string().optional(),
});

export const updateFlightSchema = Joi.object({
  airline: Joi.string(),
  flightNumber: Joi.string(),
  sector: Joi.string(),
  passengerName: Joi.string().min(2).max(100),
  vendorCost: Joi.number().positive(),
  customerAmount: Joi.number().positive(),
  departureDate: Joi.date().iso().optional(),
  returnDate: Joi.date().iso().optional(),
  clientId: Joi.string().optional(),
  notes: Joi.string().optional(),
});

export interface CreateFlightDTO {
  airline: string;
  flightNumber: string;
  pnr: string;
  sector: string;
  passengerName: string;
  vendorCost: number;
  customerAmount: number;
  departureDate?: Date;
  returnDate?: Date;
  clientId?: string;
  notes?: string;
}

export interface UpdateFlightDTO {
  airline?: string;
  flightNumber?: string;
  sector?: string;
  passengerName?: string;
  vendorCost?: number;
  customerAmount?: number;
  departureDate?: Date;
  returnDate?: Date;
  clientId?: string;
  notes?: string;
}

export interface FlightResponseDTO {
  id: string;
  airline: string;
  flightNumber: string;
  pnr: string;
  sector: string;
  passengerName: string;
  vendorCost: number;
  customerAmount: number;
  margin: number;
  departureDate?: Date;
  returnDate?: Date;
  ticketUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
