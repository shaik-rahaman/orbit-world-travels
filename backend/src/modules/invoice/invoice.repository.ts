import { Invoice, InvoiceItem, Visa, Flight, Hotel, Insurance } from '@/models/schemas';
import { Types } from 'mongoose';

export class InvoiceRepository {
  async createInvoice(data: any) {
    const invoice = await Invoice.create(data);
    return invoice.populate([
      { path: 'items' },
      { path: 'clientId', select: '_id name email' },
      { path: 'createdBy', select: '_id email firstName lastName' }
    ]);
  }

  async getInvoiceById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Invoice.findById(id).populate([
      { path: 'items' },
      { path: 'clientId', select: '_id name email' },
      { path: 'createdBy', select: '_id email firstName lastName' }
    ]);
  }

  async getInvoiceByNumber(invoiceNumber: string) {
    return Invoice.findOne({ invoiceNumber }).populate('items');
  }

  async getAllInvoices(skip: number = 0, take: number = 10, filters?: any) {
    const where: any = {};
    
    if (filters?.status) where.status = filters.status;
    if (filters?.financialYear) where.financialYear = filters.financialYear;
    if (filters?.clientId && Types.ObjectId.isValid(filters.clientId)) {
      where.clientId = new Types.ObjectId(filters.clientId);
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(where)
        .skip(skip)
        .limit(take)
        .populate([
          { path: 'items' },
          { path: 'clientId', select: 'name email' },
          { path: 'createdBy', select: 'firstName lastName email' }
        ])
        .sort({ createdAt: -1 }),
      Invoice.countDocuments(where)
    ]);

    return { invoices, total };
  }

  async updateInvoice(id: string, data: any) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Invoice.findByIdAndUpdate(id, data, { new: true }).populate('items');
  }

  async addInvoiceDocument(id: string, doc: any) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Invoice.findByIdAndUpdate(
      id,
      { $push: { documents: doc } },
      { new: true }
    ).populate([
      { path: 'items' },
      { path: 'clientId', select: '_id name email' },
      { path: 'createdBy', select: '_id email firstName lastName' }
    ]);
  }

  async deleteInvoice(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Invoice.findByIdAndDelete(id);
  }

  async addInvoiceItem(data: any) {
    // Normalize input: service may provide `referenceId`, `vendorCost`, `customerAmount`, `margin`
    const payload: any = {
      invoiceId: data.invoiceId,
      moduleType: data.moduleType,
      moduleRecordId: data.referenceId || data.moduleRecordId,
      vendorCost: data.vendorCost ?? data.vendor_cost ?? 0,
      customerAmount: data.customerAmount ?? data.customer_amount ?? data.amount ?? 0,
      margin: data.margin ?? 0,
      description: data.description,
    };
    const item = await InvoiceItem.create(payload);
    // Attach to invoice items array
    await Invoice.findByIdAndUpdate(data.invoiceId, { $push: { items: item._id } });
    return item;
  }

  async getInvoiceItem(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return InvoiceItem.findById(id);
  }

  async getLatestInvoiceNumber(financialYear: number) {
    const invoice = await Invoice.findOne({ financialYear })
      .select('invoiceNumber')
      .sort({ createdAt: -1 })
      .limit(1);
    return invoice?.invoiceNumber || null;
  }

  async getInvoicesByClient(clientId: string, skip: number = 0, take: number = 10) {
    if (!Types.ObjectId.isValid(clientId)) return { invoices: [], total: 0 };
    
    const [invoices, total] = await Promise.all([
      Invoice.find({ clientId: new Types.ObjectId(clientId) })
        .skip(skip)
        .limit(take)
        .populate('items')
        .sort({ createdAt: -1 }),
      Invoice.countDocuments({ clientId: new Types.ObjectId(clientId) })
    ]);

    return { invoices, total };
  }

  async getInvoiceStats(financialYear?: number) {
    const pipeline: any = [];

    const match: any = {};
    if (financialYear) match.financialYear = financialYear;
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    pipeline.push({
      $group: {
        _id: null,
        totalVendorCost: { $sum: '$vendorCost' },
        totalCustomerAmount: { $sum: '$customerAmount' },
        totalMargin: { $sum: '$margin' },
        count: { $sum: 1 }
      }
    });

    const result = await Invoice.aggregate(pipeline);
    return result[0] || { totalVendorCost: 0, totalCustomerAmount: 0, totalMargin: 0, count: 0 };
  }

  async removeInvoiceItem(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return InvoiceItem.findByIdAndDelete(id);
  }

  async getVisaById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Visa.findById(id);
  }

  async getFlightById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Flight.findById(id);
  }

  async getHotelById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Hotel.findById(id);
  }

  async getInsuranceById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Insurance.findById(id);
  }
}
