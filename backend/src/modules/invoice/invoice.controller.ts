import { Response, NextFunction } from 'express';
import { InvoiceService } from './invoice.service';
import { AuthenticatedRequest, ValidatedRequest } from '@/middleware';
import { ApiResponseBuilder, PaginationHelper } from '@/shared/utils';

export class InvoiceController {
  private invoiceService: InvoiceService;

  constructor() {
    this.invoiceService = new InvoiceService();
  }

  async createInvoice(
    req: AuthenticatedRequest & ValidatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const invoice = await this.invoiceService.createInvoice(
        req.validated,
        req.user!.id
      );
      return res.status(201).json(
        ApiResponseBuilder.success(invoice, 'Invoice created successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async getInvoice(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const invoice = await this.invoiceService.getInvoiceById(req.params.id);
      return res.status(200).json(ApiResponseBuilder.success(invoice));
    } catch (error) {
      next(error);
    }
  }

  async getAllInvoices(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        status: req.query.status,
        financialYear: req.query.financialYear
          ? parseInt(req.query.financialYear as string)
          : undefined,
        clientId: req.query.clientId,
      };

      const { invoices, total } = await this.invoiceService.getAllInvoices(
        page,
        limit,
        filters
      );
      const response = PaginationHelper.getPaginationResponse(
        invoices,
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

  async addLineItem(
    req: AuthenticatedRequest & ValidatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.invoiceService.addLineItem(req.params.id, req.validated);
      const invoice = await this.invoiceService.getInvoiceById(req.params.id);
      return res.status(200).json(
        ApiResponseBuilder.success(invoice, 'Line item added successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async removeLineItem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.invoiceService.removeLineItem(req.params.id, req.params.itemId);
      const invoice = await this.invoiceService.getInvoiceById(req.params.id);
      return res.status(200).json(
        ApiResponseBuilder.success(invoice, 'Line item removed successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async finalizeInvoice(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const invoice = await this.invoiceService.finalizeInvoice(req.params.id);
      return res.status(200).json(
        ApiResponseBuilder.success(invoice, 'Invoice finalized successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteInvoice(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.invoiceService.deleteInvoice(req.params.id, req.user!.role);
      return res.status(200).json(
        ApiResponseBuilder.success(null, 'Invoice deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async uploadInvoiceDocument(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ success: false, error: { message: 'No file uploaded', code: 'NO_FILE' } });
      }

      const dto = await this.invoiceService.addInvoiceDocument(req.params.id, file, req.user!.id);
      return res.status(200).json(ApiResponseBuilder.success(dto, 'Document uploaded successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const financialYear = req.query.financialYear
        ? parseInt(req.query.financialYear as string)
        : undefined;

      const stats = await this.invoiceService.getInvoiceStats(financialYear);
      return res.status(200).json(
        ApiResponseBuilder.success(stats, 'Invoice statistics retrieved')
      );
    } catch (error) {
      next(error);
    }
  }
}
