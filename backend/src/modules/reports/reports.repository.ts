import { Invoice, InvoiceItem, User } from '@/models/schemas';
import { Types } from 'mongoose';

export class ReportsRepository {
  async getSalesReport(financialYear?: number, startDate?: Date, endDate?: Date) {
    const match: any = { status: 'FINALIZED' };
    if (financialYear) match.financialYear = financialYear;
    
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = startDate;
      if (endDate) match.createdAt.$lte = endDate;
    }

    return Invoice.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: '$client' },
      {
        $project: {
          _id: 1,
          invoiceNumber: 1,
          totalCustomerAmount: 1,
          createdAt: 1,
          'client.name': 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
  }

  async getProfitReport(financialYear?: number, startDate?: Date, endDate?: Date) {
    const match: any = { status: 'FINALIZED' };
    if (financialYear) match.financialYear = financialYear;
    
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = startDate;
      if (endDate) match.createdAt.$lte = endDate;
    }

    return Invoice.aggregate([
      { $match: match },
      {
        $project: {
          _id: 1,
          invoiceNumber: 1,
          totalCustomerAmount: 1,
          totalVendorCost: 1,
          totalMargin: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
  }

  async getModuleWiseReport(financialYear?: number) {
    const match: any = {};
    if (financialYear) match['invoice.financialYear'] = financialYear;

    return InvoiceItem.aggregate([
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoiceId',
          foreignField: '_id',
          as: 'invoice'
        }
      },
      { $unwind: '$invoice' },
      { $match: match },
      {
        $group: {
          _id: '$moduleType',
          vendorCost: { $sum: '$vendorCost' },
          customerAmount: { $sum: '$customerAmount' },
          margin: { $sum: '$margin' },
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getStaffPerformanceReport(financialYear?: number) {
    const match: any = { status: 'FINALIZED' };
    if (financialYear) match.financialYear = financialYear;

    const results = await Invoice.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'staff'
        }
      },
      { $unwind: '$staff' },
      {
        $group: {
          _id: '$staff._id',
          staffName: { $first: '$staff.firstName' },
          staffEmail: { $first: '$staff.email' },
          totalRevenue: { $sum: '$totalCustomerAmount' },
          totalProfit: { $sum: '$totalMargin' },
          invoiceCount: { $sum: 1 }
        }
      },
      { $sort: { staffName: 1 } }
    ]);

    return results.map(item => ({
      id: item._id,
      name: item.staffName,
      email: item.staffEmail,
      totalRevenue: item.totalRevenue,
      totalProfit: item.totalProfit,
      invoiceCount: item.invoiceCount
    }));
  }

  async getGSTReport(financialYear?: number) {
    const match: any = { status: 'FINALIZED' };
    if (financialYear) match.financialYear = financialYear;

    const invoices = await Invoice.find(match).select(
      '_id invoiceNumber customerAmount createdAt'
    );

    const GST_RATE = 0.18;

    return invoices.map(invoice => ({
      invoiceNumber: invoice.invoiceNumber,
      amount: Number(invoice.customerAmount),
      gst: Number(invoice.customerAmount) * GST_RATE,
      totalWithGST: Number(invoice.customerAmount) * (1 + GST_RATE),
      date: invoice.createdAt
    }));
  }

  async getDashboardStats(financialYear?: number) {
    const match: any = {};
    if (financialYear) match.financialYear = financialYear;

    const matchFinalized = { ...match, status: 'FINALIZED' };

    const [totalInvoices, finalizedInvoices, totalRevenue, totalProfit] =
      await Promise.all([
        Invoice.countDocuments(match),
        Invoice.countDocuments(matchFinalized),
        Invoice.aggregate([
          { $match: matchFinalized },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalCustomerAmount' }
            }
          }
        ]),
        Invoice.aggregate([
          { $match: matchFinalized },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalMargin' }
            }
          }
        ])
      ]);

    const revenueResult = totalRevenue[0] || { total: 0 };
    const profitResult = totalProfit[0] || { total: 0 };

    return {
      totalInvoices,
      finalizedInvoices,
      draftInvoices: totalInvoices - finalizedInvoices,
      totalRevenue: Number(revenueResult.total || 0),
      totalProfit: Number(profitResult.total || 0)
    };
  }
}
