import { Router } from 'express';
import { HotelController } from './hotel.controller';
import { authMiddleware, validateRequest } from '@/middleware';
import { createHotelSchema, updateHotelSchema } from '@/shared/dtos';

const router = Router();
const hotelController = new HotelController();

router.use(authMiddleware);

router.post(
  '/',
  validateRequest(createHotelSchema, 'body'),
  (req, res, next) => hotelController.createHotel(req, res, next)
);

router.get('/', (req, res, next) =>
  hotelController.getAllHotels(req, res, next)
);

router.get('/:id', (req, res, next) =>
  hotelController.getHotel(req, res, next)
);

router.put(
  '/:id',
  validateRequest(updateHotelSchema, 'body'),
  (req, res, next) => hotelController.updateHotel(req, res, next)
);

router.delete('/:id', (req, res, next) =>
  hotelController.deleteHotel(req, res, next)
);

export default router;
