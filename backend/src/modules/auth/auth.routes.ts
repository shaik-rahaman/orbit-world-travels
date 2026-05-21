import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest, authMiddleware, adminOnlyMiddleware } from '@/middleware';
import {
  createUserSchema,
  loginSchema,
  updateUserSchema,
} from '@/shared/dtos';

const router = Router();
const authController = new AuthController();

// Public routes
router.post(
  '/register',
  validateRequest(createUserSchema, 'body'),
  (req, res, next) => authController.register(req, res, next)
);

router.post(
  '/login',
  validateRequest(loginSchema, 'body'),
  (req, res, next) => authController.login(req, res, next)
);

// Protected routes
router.get('/me', authMiddleware, (req, res, next) =>
  authController.getCurrentUser(req, res, next)
);

router.put(
  '/profile',
  authMiddleware,
  validateRequest(updateUserSchema, 'body'),
  (req, res, next) => authController.updateProfile(req, res, next)
);

// Admin-only routes
router.get('/users', authMiddleware, adminOnlyMiddleware, (req, res, next) =>
  authController.getAllUsers(req, res, next)
);

router.put(
  '/users/:id',
  authMiddleware,
  adminOnlyMiddleware,
  validateRequest(updateUserSchema, 'body'),
  (req, res, next) => authController.updateUser(req, res, next)
);

router.delete(
  '/users/:id',
  authMiddleware,
  adminOnlyMiddleware,
  (req, res, next) => authController.deleteUser(req, res, next)
);

export default router;
