import Joi from 'joi';

export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  firstName: Joi.string().min(2).max(100),
  lastName: Joi.string().min(2).max(100),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
  role: Joi.string().valid('ADMIN', 'STAFF', 'DEMO').default('STAFF'),
}).or('name', 'firstName');

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  role: Joi.string().valid('ADMIN', 'STAFF', 'DEMO'),
  isActive: Joi.boolean(),
});

export interface CreateUserDTO {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
