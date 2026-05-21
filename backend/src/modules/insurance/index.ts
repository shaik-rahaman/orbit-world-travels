import { Router } from 'express';
import { InsuranceController } from './insurance.controller';
import { authMiddleware, validateRequest } from '@/middleware';
import { createInsuranceSchema, updateInsuranceSchema } from '@/shared/dtos';

const router = Router();
const insuranceController = new InsuranceController();

router.use(authMiddleware);

router.post(
  '/',
  validateRequest(createInsuranceSchema, 'body'),
  (req, res, next) => insuranceController.createInsurance(req, res, next)
);

router.get('/', (req, res, next) =>
  insuranceController.getAllInsurance(req, res, next)
);

router.get('/:id', (req, res, next) =>
  insuranceController.getInsurance(req, res, next)
);

router.put(
  '/:id',
  validateRequest(updateInsuranceSchema, 'body'),
  (req, res, next) => insuranceController.updateInsurance(req, res, next)
);

router.delete('/:id', (req, res, next) =>
  insuranceController.deleteInsurance(req, res, next)
);

export default router;
