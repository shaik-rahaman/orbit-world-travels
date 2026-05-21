import { Response, NextFunction } from 'express';
import { InsuranceService } from './insurance.service';
import { AuthenticatedRequest, ValidatedRequest } from '@/middleware';
import { ApiResponseBuilder, PaginationHelper } from '@/shared/utils';

export class InsuranceController {
  private insuranceService: InsuranceService;

  constructor() {
    this.insuranceService = new InsuranceService();
  }

  async createInsurance(
    req: AuthenticatedRequest & ValidatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const insurance = await this.insuranceService.createInsurance(
        req.validated,
        req.user!.id
      );
      return res.status(201).json(
        ApiResponseBuilder.success(insurance, 'Insurance created successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async getInsurance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const insurance = await this.insuranceService.getInsuranceById(req.params.id);
      return res.status(200).json(ApiResponseBuilder.success(insurance));
    } catch (error) {
      next(error);
    }
  }

  async getAllInsurance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        policyType: req.query.policyType,
        insuredName: req.query.insuredName,
        clientId: req.query.clientId,
      };

      const { insurance, total } = await this.insuranceService.getAllInsurance(
        page,
        limit,
        filters
      );
      const response = PaginationHelper.getPaginationResponse(
        insurance,
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

  async updateInsurance(
    req: AuthenticatedRequest & ValidatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const insurance = await this.insuranceService.updateInsurance(
        req.params.id,
        req.validated
      );
      return res.status(200).json(
        ApiResponseBuilder.success(insurance, 'Insurance updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteInsurance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.insuranceService.deleteInsurance(req.params.id);
      return res.status(200).json(
        ApiResponseBuilder.success(null, 'Insurance deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}
