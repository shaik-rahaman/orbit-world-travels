import { Response, NextFunction } from 'express';
import { FlightService } from './flight.service';
import { AuthenticatedRequest, ValidatedRequest } from '@/middleware';
import { ApiResponseBuilder, PaginationHelper } from '@/shared/utils';

export class FlightController {
  private flightService: FlightService;

  constructor() {
    this.flightService = new FlightService();
  }

  async createFlight(
    req: AuthenticatedRequest & ValidatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const flight = await this.flightService.createFlight(
        req.validated,
        req.user!.id
      );
      return res.status(201).json(
        ApiResponseBuilder.success(flight, 'Flight created successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async getFlight(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const flight = await this.flightService.getFlightById(req.params.id);
      return res.status(200).json(ApiResponseBuilder.success(flight));
    } catch (error) {
      next(error);
    }
  }

  async getAllFlights(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        airline: req.query.airline,
        passengerName: req.query.passengerName,
        clientId: req.query.clientId,
      };

      const { flights, total } = await this.flightService.getAllFlights(
        page,
        limit,
        filters
      );
      const response = PaginationHelper.getPaginationResponse(
        flights,
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

  async updateFlight(
    req: AuthenticatedRequest & ValidatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const flight = await this.flightService.updateFlight(
        req.params.id,
        req.validated
      );
      return res.status(200).json(
        ApiResponseBuilder.success(flight, 'Flight updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteFlight(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.flightService.deleteFlight(req.params.id);
      return res.status(200).json(
        ApiResponseBuilder.success(null, 'Flight deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}
