import { Router } from 'express';
import { CrmController } from './crm.controller';
import { authMiddleware, validateRequest } from '@/middleware';
import { createClientSchema, updateClientSchema } from '@/shared/dtos';

const router = Router();
const crmController = new CrmController();

router.use(authMiddleware);

router.post(
  '/',
  validateRequest(createClientSchema, 'body'),
  (req, res, next) => crmController.createClient(req, res, next)
);

router.get('/', (req, res, next) =>
  crmController.getAllClients(req, res, next)
);

router.get('/:id', (req, res, next) =>
  crmController.getClient(req, res, next)
);

router.put(
  '/:id',
  validateRequest(updateClientSchema, 'body'),
  (req, res, next) => crmController.updateClient(req, res, next)
);

router.delete('/:id', (req, res, next) =>
  crmController.deleteClient(req, res, next)
);

export default router;
