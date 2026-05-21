import { Response, NextFunction } from 'express';
import { VisaService } from './visa.service';
import { AuthenticatedRequest, ValidatedRequest } from '@/middleware';
import { ApiResponseBuilder, PaginationHelper } from '@/shared/utils';

export class VisaController {
  private visaService: VisaService;

  constructor() {
    this.visaService = new VisaService();
  }

  async createVisa(
    req: AuthenticatedRequest & ValidatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const visa = await this.visaService.createVisa(req.validated, req.user!.id);
      return res.status(201).json(
        ApiResponseBuilder.success(visa, 'Visa created successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async getVisa(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const visa = await this.visaService.getVisaById(req.params.id);
      return res.status(200).json(ApiResponseBuilder.success(visa));
    } catch (error) {
      next(error);
    }
  }

  async getAllVisas(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        status: req.query.status,
        country: req.query.country,
        clientId: req.query.clientId,
      };

      const { visas, total } = await this.visaService.getAllVisas(
        page,
        limit,
        filters
      );
      const response = PaginationHelper.getPaginationResponse(
        visas,
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

  async updateVisa(
    req: AuthenticatedRequest & ValidatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const visa = await this.visaService.updateVisa(
        req.params.id,
        req.validated
      );
      return res.status(200).json(
        ApiResponseBuilder.success(visa, 'Visa updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteVisa(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.visaService.deleteVisa(req.params.id);
      return res.status(200).json(
        ApiResponseBuilder.success(null, 'Visa deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}
