import { Response, NextFunction } from 'express';
import { CrmService } from './crm.service';
import { AuthenticatedRequest, ValidatedRequest } from '@/middleware';
import { ApiResponseBuilder, PaginationHelper } from '@/shared/utils';

export class CrmController {
  private crmService: CrmService;

  constructor() {
    this.crmService = new CrmService();
  }

  async createClient(
    req: AuthenticatedRequest & ValidatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const client = await this.crmService.createClient(
        req.validated,
        req.user!.id
      );
      return res.status(201).json(
        ApiResponseBuilder.success(client, 'Client created successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async getClient(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const client = await this.crmService.getClientById(req.params.id);
      return res.status(200).json(ApiResponseBuilder.success(client));
    } catch (error) {
      next(error);
    }
  }

  async getAllClients(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        name: req.query.name,
        email: req.query.email,
        country: req.query.country,
      };

      const { clients, total } = await this.crmService.getAllClients(
        page,
        limit,
        filters
      );
      const response = PaginationHelper.getPaginationResponse(
        clients,
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

  async updateClient(
    req: AuthenticatedRequest & ValidatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const client = await this.crmService.updateClient(
        req.params.id,
        req.validated
      );
      return res.status(200).json(
        ApiResponseBuilder.success(client, 'Client updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteClient(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.crmService.deleteClient(req.params.id);
      return res.status(200).json(
        ApiResponseBuilder.success(null, 'Client deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}
