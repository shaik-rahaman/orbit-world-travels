import { InvoiceRepository } from './invoice.repository';
import {
  CreateInvoiceDTO,
  InvoiceItemInput,
  InvoiceResponseDTO,
} from '@/shared/dtos';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@/shared/exceptions';
import {
  FinancialYearHelper,
  MarginCalculator,
} from '@/shared/utils/helpers';
import { ModuleType } from '@/models/schemas';

export class InvoiceService {
  private invoiceRepository: InvoiceRepository;

  constructor() {
    this.invoiceRepository = new InvoiceRepository();
  }

  async createInvoice(
    data: CreateInvoiceDTO,
    userId: string
  ): Promise<InvoiceResponseDTO> {
    const { financialYear, clientId, notes } = data;

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(financialYear);

    const invoice = await this.invoiceRepository.createInvoice({
      invoiceNumber,
      financialYear: String(financialYear),
      createdBy: userId,
      clientId: clientId || undefined,
      description: notes,
      vendorCost: 0,
      customerAmount: 0,
      margin: 0,
    });

    return this.mapInvoiceToDTO(invoice);
  }

  async getInvoiceById(id: string): Promise<InvoiceResponseDTO> {
    const invoice = await this.invoiceRepository.getInvoiceById(id);

    if (!invoice) {
      throw new NotFoundException('Invoice');
    }

    return this.mapInvoiceToDTO(invoice);
  }

  async getAllInvoices(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Promise<{ invoices: InvoiceResponseDTO[]; total: number }> {
    const skip = (page - 1) * limit;
    const { invoices, total } = await this.invoiceRepository.getAllInvoices(
      skip,
      limit,
      filters
    );

    return {
      invoices: invoices.map((inv) => this.mapInvoiceToDTO(inv)),
      total,
    };
  }

  async addLineItem(
    invoiceId: string,
    item: InvoiceItemInput
  ): Promise<void> {
    const invoice = await this.invoiceRepository.getInvoiceById(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice');
    }

    if (invoice.status === 'FINALIZED') {
      throw new ForbiddenException(
        'Cannot add items to finalized invoices'
      );
    }

    // Fetch the reference item based on module type
    let vendorCost: number | null = null;
    let customerAmount: number | null = null;
    let margin: number | null = null;
    let referenceItem: any = null;

    switch (item.moduleType) {
      case 'VISA':
        referenceItem = await this.invoiceRepository.getVisaById(
          item.referenceId
        );
        break;
      case 'FLIGHT':
        referenceItem = await this.invoiceRepository.getFlightById(
          item.referenceId
        );
        break;
      case 'HOTEL':
        referenceItem = await this.invoiceRepository.getHotelById(
          item.referenceId
        );
        break;
      case 'INSURANCE':
        referenceItem = await this.invoiceRepository.getInsuranceById(
          item.referenceId
        );
        break;
    }

    if (!referenceItem) {
      throw new NotFoundException(
        `${item.moduleType} record with ID ${item.referenceId}`
      );
    }

    // Map from booking record properties to invoice item properties (handle different field names)
    vendorCost = referenceItem.vendorCost ?? referenceItem.cost ?? null;
    customerAmount = referenceItem.customerAmount ?? referenceItem.sellingPrice ?? null;
    // Compute margin if not provided on the reference item
    if (referenceItem.margin !== undefined && referenceItem.margin !== null) {
      margin = referenceItem.margin;
    } else if (vendorCost != null && customerAmount != null) {
      margin = Number(customerAmount) - Number(vendorCost);
    } else {
      margin = null;
    }

    // Create invoice item
    await this.invoiceRepository.addInvoiceItem({
      invoiceId: invoiceId,
      moduleType: item.moduleType as ModuleType,
      referenceId: item.referenceId,
      vendorCost,
      customerAmount,
      margin,
      description: item.description,
    });

    // Update invoice totals
    await this.recalculateInvoiceTotals(invoiceId);
  }

  async removeLineItem(invoiceId: string, itemId: string): Promise<void> {
    const invoice = await this.invoiceRepository.getInvoiceById(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice');
    }

    if (invoice.status === 'FINALIZED') {
      throw new ForbiddenException(
        'Cannot remove items from finalized invoices'
      );
    }

    const item = await this.invoiceRepository.getInvoiceItem(itemId);
    if (!item || (item.invoiceId && (item.invoiceId as any).toString() !== invoiceId)) {
      throw new NotFoundException('Invoice item');
    }

    await this.invoiceRepository.removeInvoiceItem(itemId);
    await this.recalculateInvoiceTotals(invoiceId);
  }

  async finalizeInvoice(invoiceId: string): Promise<InvoiceResponseDTO> {
    const invoice = await this.invoiceRepository.getInvoiceById(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice');
    }

    if (invoice.status === 'FINALIZED') {
      throw new BadRequestException('Invoice is already finalized');
    }

    if (!invoice.items || invoice.items.length === 0) {
      throw new BadRequestException('Cannot finalize an empty invoice');
    }

    const updatedInvoice = await this.invoiceRepository.updateInvoice(
      invoiceId,
      { status: 'FINALIZED' }
    );

    return this.mapInvoiceToDTO(updatedInvoice);
  }

  async deleteInvoice(invoiceId: string, userRole: string): Promise<void> {
    const invoice = await this.invoiceRepository.getInvoiceById(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice');
    }

    // Staff cannot delete finalized invoices
    if (invoice.status === 'FINALIZED' && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Only admins can delete finalized invoices'
      );
    }

    await this.invoiceRepository.deleteInvoice(invoiceId);
  }

  private async generateInvoiceNumber(financialYear: number): Promise<string> {
    const latestInvoice = await this.invoiceRepository.getLatestInvoiceNumber(
      financialYear
    );

    let sequence = 1;
    if (latestInvoice) {
      const match = latestInvoice.match(/\/(\d+)$/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }

    return FinancialYearHelper.formatInvoiceNumber(financialYear, sequence);
  }

  private async recalculateInvoiceTotals(invoiceId: string): Promise<void> {
    const invoice = await this.invoiceRepository.getInvoiceById(invoiceId);

    if (!invoice) return;

    let totalVendorCost = 0;
    let totalCustomerAmount = 0;

    // Handle items as array of ObjectIds that need to be populated
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    
    if (items.length === 0) {
      await this.invoiceRepository.updateInvoice(invoiceId, {
        vendorCost: 0,
        customerAmount: 0,
        margin: 0,
      });
      return;
    }

    // If items are populated (have properties), use them directly
    // Otherwise, they're just IDs and we skip detailed calculation
    for (const item of items) {
      if (typeof item === 'object' && item !== null) {
        totalVendorCost += (item as any).vendorCost || 0;
        totalCustomerAmount += (item as any).customerAmount || 0;
      }
    }

    const totalMargin = totalCustomerAmount - totalVendorCost;

    await this.invoiceRepository.updateInvoice(invoiceId, {
      vendorCost: totalVendorCost,
      customerAmount: totalCustomerAmount,
      margin: totalMargin,
    });
  }

  private mapInvoiceToDTO(invoice: any): InvoiceResponseDTO {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      financialYear: invoice.financialYear,
      status: invoice.status,
      totalVendorCost: invoice.vendorCost && invoice.vendorCost.toNumber
        ? invoice.vendorCost.toNumber()
        : Number(invoice.vendorCost || 0),
      totalCustomerAmount: invoice.customerAmount && invoice.customerAmount.toNumber
        ? invoice.customerAmount.toNumber()
        : Number(invoice.customerAmount || 0),
      totalMargin: invoice.margin && invoice.margin.toNumber
        ? invoice.margin.toNumber()
        : Number(invoice.margin || 0),
      notes: invoice.description,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      invoiceItems: (invoice.items || []).map((item: any) => ({
        id: item._id || item.id,
        moduleType: item.moduleType,
        referenceId: item.moduleRecordId || item.referenceId,
        vendorCost: item.vendorCost && item.vendorCost.toNumber
          ? item.vendorCost.toNumber()
          : Number(item.vendorCost || 0),
        customerAmount: item.customerAmount && item.customerAmount.toNumber
          ? item.customerAmount.toNumber()
          : Number(item.customerAmount || 0),
        margin: item.margin && item.margin.toNumber
          ? item.margin.toNumber()
          : Number(item.margin || 0),
        description: item.description,
      })),
    };
  }

  async getInvoiceStats(financialYear?: number) {
    return this.invoiceRepository.getInvoiceStats(financialYear);
  }

  async addInvoiceDocument(invoiceId: string, file: any, userId: string) {
    const invoice = await this.invoiceRepository.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new NotFoundException('Invoice');
    }

    const doc = {
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      uploadedAt: new Date(),
      uploadedBy: userId,
    };

    const updated = await this.invoiceRepository.addInvoiceDocument(invoiceId, doc);
    return this.mapInvoiceToDTO(updated);
  }
}
