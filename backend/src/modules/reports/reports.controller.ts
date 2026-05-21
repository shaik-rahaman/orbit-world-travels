import { Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { AuthenticatedRequest } from '@/middleware';
import { ApiResponseBuilder } from '@/shared/utils';

export class ReportsController {
  private reportsService: ReportsService;

  constructor() {
    this.reportsService = new ReportsService();
  }

  async getSalesReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const financialYear = req.query.financialYear
        ? parseInt(req.query.financialYear as string)
        : undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const report = await this.reportsService.getSalesReport(
        financialYear,
        startDate,
        endDate
      );
      return res.status(200).json(ApiResponseBuilder.success(report));
    } catch (error) {
      next(error);
    }
  }

  async getProfitReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const financialYear = req.query.financialYear
        ? parseInt(req.query.financialYear as string)
        : undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const report = await this.reportsService.getProfitReport(
        financialYear,
        startDate,
        endDate
      );
      return res.status(200).json(ApiResponseBuilder.success(report));
    } catch (error) {
      next(error);
    }
  }

  async getModuleWiseReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const financialYear = req.query.financialYear
        ? parseInt(req.query.financialYear as string)
        : undefined;

      const report = await this.reportsService.getModuleWiseReport(financialYear);
      return res.status(200).json(ApiResponseBuilder.success(report));
    } catch (error) {
      next(error);
    }
  }

  async getStaffPerformanceReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const financialYear = req.query.financialYear
        ? parseInt(req.query.financialYear as string)
        : undefined;

      const report = await this.reportsService.getStaffPerformanceReport(financialYear);
      return res.status(200).json(
        ApiResponseBuilder.success(report, 'Staff performance report retrieved')
      );
    } catch (error) {
      next(error);
    }
  }

  async getGSTReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const financialYear = req.query.financialYear
        ? parseInt(req.query.financialYear as string)
        : undefined;

      const report = await this.reportsService.getGSTReport(financialYear);
      return res.status(200).json(ApiResponseBuilder.success(report));
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const financialYear = req.query.financialYear
        ? parseInt(req.query.financialYear as string)
        : undefined;

      const stats = await this.reportsService.getDashboardStats(financialYear);
      return res.status(200).json(
        ApiResponseBuilder.success(stats, 'Dashboard statistics retrieved')
      );
    } catch (error) {
      next(error);
    }
  }
}
