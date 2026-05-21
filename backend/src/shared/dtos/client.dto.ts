import Joi from 'joi';

export const createClientSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  country: Joi.string().optional(),
});

export const updateClientSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  country: Joi.string().optional(),
});

export interface CreateClientDTO {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
}

export interface UpdateClientDTO {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
}

export interface ClientResponseDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}
