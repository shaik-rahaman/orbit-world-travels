import Joi from 'joi';

export const createHotelSchema = Joi.object({
  hotelName: Joi.string().required(),
  city: Joi.string().required(),
  checkInDate: Joi.date().iso().required(),
  checkOutDate: Joi.date().iso().required(),
  roomType: Joi.string().required(),
  guestName: Joi.string().required().min(2).max(100),
  vendorCost: Joi.number().positive().required(),
  customerAmount: Joi.number().positive().required(),
  bookingReference: Joi.string().optional(),
  clientId: Joi.string().optional(),
  notes: Joi.string().optional(),
});

export const updateHotelSchema = Joi.object({
  hotelName: Joi.string(),
  city: Joi.string(),
  checkInDate: Joi.date().iso(),
  checkOutDate: Joi.date().iso(),
  roomType: Joi.string(),
  guestName: Joi.string().min(2).max(100),
  vendorCost: Joi.number().positive(),
  customerAmount: Joi.number().positive(),
  bookingReference: Joi.string().optional(),
  clientId: Joi.string().optional(),
  notes: Joi.string().optional(),
});

export interface CreateHotelDTO {
  hotelName: string;
  city: string;
  checkInDate: Date;
  checkOutDate: Date;
  roomType: string;
  guestName: string;
  vendorCost: number;
  customerAmount: number;
  bookingReference?: string;
  clientId?: string;
  notes?: string;
}

export interface UpdateHotelDTO {
  hotelName?: string;
  city?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  roomType?: string;
  guestName?: string;
  vendorCost?: number;
  customerAmount?: number;
  bookingReference?: string;
  clientId?: string;
  notes?: string;
}

export interface HotelResponseDTO {
  id: string;
  hotelName: string;
  city: string;
  checkInDate: Date;
  checkOutDate: Date;
  roomType: string;
  guestName: string;
  vendorCost: number;
  customerAmount: number;
  margin: number;
  bookingReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
