import { Response, NextFunction } from 'express';
import { HotelService } from './hotel.service';
import { AuthenticatedRequest, ValidatedRequest } from '@/middleware';
import { ApiResponseBuilder, PaginationHelper } from '@/shared/utils';

export class HotelController {
  private hotelService: HotelService;

  constructor() {
    this.hotelService = new HotelService();
  }

  async createHotel(
    req: AuthenticatedRequest & ValidatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const hotel = await this.hotelService.createHotel(
        req.validated,
        req.user!.id
      );
      return res.status(201).json(
        ApiResponseBuilder.success(hotel, 'Hotel created successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async getHotel(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const hotel = await this.hotelService.getHotelById(req.params.id);
      return res.status(200).json(ApiResponseBuilder.success(hotel));
    } catch (error) {
      next(error);
    }
  }

  async getAllHotels(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        city: req.query.city,
        hotelName: req.query.hotelName,
        clientId: req.query.clientId,
      };

      const { hotels, total } = await this.hotelService.getAllHotels(
        page,
        limit,
        filters
      );
      const response = PaginationHelper.getPaginationResponse(
        hotels,
        total,
        page,
        limit
      );

      return res.status(200).json({
        success: true,
        ...response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateHotel(
    req: AuthenticatedRequest & ValidatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const hotel = await this.hotelService.updateHotel(
        req.params.id,
        req.validated
      );
      return res.status(200).json(
        ApiResponseBuilder.success(hotel, 'Hotel updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteHotel(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.hotelService.deleteHotel(req.params.id);
      return res.status(200).json(
        ApiResponseBuilder.success(null, 'Hotel deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}
