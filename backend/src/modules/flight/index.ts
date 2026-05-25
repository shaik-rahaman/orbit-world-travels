import { Router } from 'express';
import { FlightController } from './flight.controller';
import { authMiddleware, validateRequest, readOnlyMiddleware } from '@/middleware';
import { createFlightSchema, updateFlightSchema } from '@/shared/dtos';

const router = Router();
const flightController = new FlightController();

router.use(authMiddleware);
router.use(readOnlyMiddleware); // Apply RBAC - block write operations for demo users

router.post(
  '/',
  validateRequest(createFlightSchema, 'body'),
  (req, res, next) => flightController.createFlight(req, res, next)
);

router.get('/', (req, res, next) =>
  flightController.getAllFlights(req, res, next)
);

router.get('/:id', (req, res, next) =>
  flightController.getFlight(req, res, next)
);

router.put(
  '/:id',
  validateRequest(updateFlightSchema, 'body'),
  (req, res, next) => flightController.updateFlight(req, res, next)
);

router.delete('/:id', (req, res, next) =>
  flightController.deleteFlight(req, res, next)
);

export default router;
