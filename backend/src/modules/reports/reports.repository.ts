import { Invoice, InvoiceItem, User, Visa, Flight, Hotel, Insurance } from '@/models/schemas';
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

    // Get invoices
    const invoiceData = await Invoice.aggregate([
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
          'client.name': 1,
          type: { $literal: 'INVOICE' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    // Also get data from Visa, Flight, Hotel, Insurance collections
    const dateMatch: any = {};
    if (startDate || endDate) {
      dateMatch.createdAt = {};
      if (startDate) dateMatch.createdAt.$gte = startDate;
      if (endDate) dateMatch.createdAt.$lte = endDate;
    }

    const [visas, flights, hotels, insurance] = await Promise.all([
      Visa.find(dateMatch).select('_id applicantName sellingPrice createdAt').lean(),
      Flight.find(dateMatch).select('_id passengerName sellingPrice createdAt').lean(),
      Hotel.find(dateMatch).select('_id guestName sellingPrice createdAt').lean(),
      Insurance.find(dateMatch).select('_id holderName sellingPrice createdAt').lean(),
    ]);

    const moduleData = [
      ...visas.map((v: any) => ({
        _id: v._id,
        invoiceNumber: `VISA-${v._id}`,
        totalCustomerAmount: v.sellingPrice || 0,
        createdAt: v.createdAt,
        'client.name': v.applicantName || 'Unknown',
        type: 'VISA'
      })),
      ...flights.map((f: any) => ({
        _id: f._id,
        invoiceNumber: `FLIGHT-${f._id}`,
        totalCustomerAmount: f.sellingPrice || 0,
        createdAt: f.createdAt,
        'client.name': f.passengerName || 'Unknown',
        type: 'FLIGHT'
      })),
      ...hotels.map((h: any) => ({
        _id: h._id,
        invoiceNumber: `HOTEL-${h._id}`,
        totalCustomerAmount: h.sellingPrice || 0,
        createdAt: h.createdAt,
        'client.name': h.guestName || 'Unknown',
        type: 'HOTEL'
      })),
      ...insurance.map((i: any) => ({
        _id: i._id,
        invoiceNumber: `INSURANCE-${i._id}`,
        totalCustomerAmount: i.sellingPrice || 0,
        createdAt: i.createdAt,
        'client.name': i.holderName || 'Unknown',
        type: 'INSURANCE'
      }))
    ];

    return [...invoiceData, ...moduleData].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getProfitReport(financialYear?: number, startDate?: Date, endDate?: Date) {
    const match: any = { status: 'FINALIZED' };
    if (financialYear) match.financialYear = financialYear;
    
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = startDate;
      if (endDate) match.createdAt.$lte = endDate;
    }

    // Get invoices
    const invoiceData = await Invoice.aggregate([
      { $match: match },
      {
        $project: {
          _id: 1,
          invoiceNumber: 1,
          totalCustomerAmount: 1,
          totalVendorCost: 1,
          totalMargin: 1,
          createdAt: 1,
          type: { $literal: 'INVOICE' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    // Also get data from Visa, Flight, Hotel, Insurance collections
    const dateMatch: any = {};
    if (startDate || endDate) {
      dateMatch.createdAt = {};
      if (startDate) dateMatch.createdAt.$gte = startDate;
      if (endDate) dateMatch.createdAt.$lte = endDate;
    }

    const [visas, flights, hotels, insurance] = await Promise.all([
      Visa.find(dateMatch).select('_id sellingPrice cost margin createdAt').lean(),
      Flight.find(dateMatch).select('_id sellingPrice cost margin createdAt').lean(),
      Hotel.find(dateMatch).select('_id sellingPrice cost margin createdAt').lean(),
      Insurance.find(dateMatch).select('_id sellingPrice cost margin createdAt').lean(),
    ]);

    const moduleData = [
      ...visas.map((v: any) => ({
        _id: v._id,
        invoiceNumber: `VISA-${v._id}`,
        totalCustomerAmount: v.sellingPrice || 0,
        totalVendorCost: v.cost || 0,
        totalMargin: v.margin || 0,
        createdAt: v.createdAt,
        type: 'VISA'
      })),
      ...flights.map((f: any) => ({
        _id: f._id,
        invoiceNumber: `FLIGHT-${f._id}`,
        totalCustomerAmount: f.sellingPrice || 0,
        totalVendorCost: f.cost || 0,
        totalMargin: f.margin || 0,
        createdAt: f.createdAt,
        type: 'FLIGHT'
      })),
      ...hotels.map((h: any) => ({
        _id: h._id,
        invoiceNumber: `HOTEL-${h._id}`,
        totalCustomerAmount: h.sellingPrice || 0,
        totalVendorCost: h.cost || 0,
        totalMargin: h.margin || 0,
        createdAt: h.createdAt,
        type: 'HOTEL'
      })),
      ...insurance.map((i: any) => ({
        _id: i._id,
        invoiceNumber: `INSURANCE-${i._id}`,
        totalCustomerAmount: i.sellingPrice || 0,
        totalVendorCost: i.cost || 0,
        totalMargin: i.margin || 0,
        createdAt: i.createdAt,
        type: 'INSURANCE'
      }))
    ];

    return [...invoiceData, ...moduleData].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getModuleWiseReport(financialYear?: number) {
    const match: any = {};
    if (financialYear) match['invoice.financialYear'] = financialYear;

    // Get data from InvoiceItems
    const invoiceItemData = await InvoiceItem.aggregate([
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

    // Also get direct counts from module collections
    const dateMatch: any = {};
    if (financialYear) {
      // For direct modules, we can't filter by financialYear since they don't have it
      // So we'll include all
    }

    const [visaCount, flightCount, hotelCount, insuranceCount] = await Promise.all([
      Visa.aggregate([
        {
          $group: {
            _id: null,
            vendorCost: { $sum: '$cost' },
            customerAmount: { $sum: '$sellingPrice' },
            margin: { $sum: '$margin' },
            count: { $sum: 1 }
          }
        }
      ]),
      Flight.aggregate([
        {
          $group: {
            _id: null,
            vendorCost: { $sum: '$cost' },
            customerAmount: { $sum: '$sellingPrice' },
            margin: { $sum: '$margin' },
            count: { $sum: 1 }
          }
        }
      ]),
      Hotel.aggregate([
        {
          $group: {
            _id: null,
            vendorCost: { $sum: '$cost' },
            customerAmount: { $sum: '$sellingPrice' },
            margin: { $sum: '$margin' },
            count: { $sum: 1 }
          }
        }
      ]),
      Insurance.aggregate([
        {
          $group: {
            _id: null,
            vendorCost: { $sum: '$cost' },
            customerAmount: { $sum: '$sellingPrice' },
            margin: { $sum: '$margin' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const moduleDataMap: any = {};
    invoiceItemData.forEach((item: any) => {
      const key = item._id.toUpperCase();
      moduleDataMap[key] = item;
    });

    // Merge with direct module data
    const mergeModuleData = (key: string, data: any[]) => {
      const item = data[0];
      if (!item) return;
      if (!moduleDataMap[key]) {
        moduleDataMap[key] = {
          _id: key,
          vendorCost: 0,
          customerAmount: 0,
          margin: 0,
          count: 0
        };
      }
      moduleDataMap[key].vendorCost += item.vendorCost || 0;
      moduleDataMap[key].customerAmount += item.customerAmount || 0;
      moduleDataMap[key].margin += item.margin || 0;
      moduleDataMap[key].count += item.count || 0;
    };

    mergeModuleData('VISA', visaCount);
    mergeModuleData('FLIGHT', flightCount);
    mergeModuleData('HOTEL', hotelCount);
    mergeModuleData('INSURANCE', insuranceCount);

    return Object.values(moduleDataMap);
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

    // Get Invoice data
    const [totalInvoices, finalizedInvoices, totalInvoiceRevenue, totalInvoiceProfit] =
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

    // Get data from module collections (Visa, Flight, Hotel, Insurance)
    const [visaStats, flightStats, hotelStats, insuranceStats] = await Promise.all([
      Visa.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: '$sellingPrice' },
            profit: { $sum: '$margin' }
          }
        }
      ]),
      Flight.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: '$sellingPrice' },
            profit: { $sum: '$margin' }
          }
        }
      ]),
      Hotel.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: '$sellingPrice' },
            profit: { $sum: '$margin' }
          }
        }
      ]),
      Insurance.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: '$sellingPrice' },
            profit: { $sum: '$margin' }
          }
        }
      ])
    ]);

    const invoiceRevenueResult = totalInvoiceRevenue[0] || { total: 0 };
    const invoiceProfitResult = totalInvoiceProfit[0] || { total: 0 };

    // Sum up all module revenues and profits
    const moduleRevenue = 
      (visaStats[0]?.revenue || 0) +
      (flightStats[0]?.revenue || 0) +
      (hotelStats[0]?.revenue || 0) +
      (insuranceStats[0]?.revenue || 0);

    const moduleProfit =
      (visaStats[0]?.profit || 0) +
      (flightStats[0]?.profit || 0) +
      (hotelStats[0]?.profit || 0) +
      (insuranceStats[0]?.profit || 0);

    const totalRevenue = Number(invoiceRevenueResult.total || 0) + moduleRevenue;
    const totalProfit = Number(invoiceProfitResult.total || 0) + moduleProfit;

    return {
      totalInvoices,
      finalizedInvoices,
      draftInvoices: totalInvoices - finalizedInvoices,
      totalRevenue,
      totalProfit
    };
  }
}
