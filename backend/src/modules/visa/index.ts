import { Router } from 'express';
import { VisaController } from './visa.controller';
import { authMiddleware, validateRequest, readOnlyMiddleware } from '@/middleware';
import { createVisaSchema, updateVisaSchema } from '@/shared/dtos';

const router = Router();
const visaController = new VisaController();

router.use(authMiddleware);
router.use(readOnlyMiddleware); // Apply RBAC - block write operations for demo users

router.post(
  '/',
  validateRequest(createVisaSchema, 'body'),
  (req, res, next) => visaController.createVisa(req, res, next)
);

router.get('/', (req, res, next) =>
  visaController.getAllVisas(req, res, next)
);

router.get('/:id', (req, res, next) =>
  visaController.getVisa(req, res, next)
);

router.put(
  '/:id',
  validateRequest(updateVisaSchema, 'body'),
  (req, res, next) => visaController.updateVisa(req, res, next)
);

router.delete('/:id', (req, res, next) =>
  visaController.deleteVisa(req, res, next)
);

export default router;
