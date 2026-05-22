import { ReportsRepository } from './reports.repository';

export class ReportsService {
  private reportsRepository: ReportsRepository;

  constructor() {
    this.reportsRepository = new ReportsRepository();
  }

  async getSalesReport(
    financialYear?: number,
    startDate?: Date,
    endDate?: Date
  ) {
    const data = await this.reportsRepository.getSalesReport(
      financialYear,
      startDate,
      endDate
    );

    const totalSales = data.reduce(
      (sum, item) => sum + Number(item.totalCustomerAmount),
      0
    );

    return {
      data,
      summary: {
        totalInvoices: data.length,
        totalSales,
        averageSale: data.length > 0 ? totalSales / data.length : 0,
      },
    };
  }

  async getProfitReport(
    financialYear?: number,
    startDate?: Date,
    endDate?: Date
  ) {
    const data = await this.reportsRepository.getProfitReport(
      financialYear,
      startDate,
      endDate
    );

    const totalRevenue = data.reduce(
      (sum, item) => sum + Number(item.totalCustomerAmount),
      0
    );
    const totalCost = data.reduce(
      (sum, item) => sum + Number(item.totalVendorCost),
      0
    );
    const totalProfit = data.reduce(
      (sum, item) => sum + Number(item.totalMargin),
      0
    );
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      data,
      summary: {
        totalInvoices: data.length,
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin: parseFloat(profitMargin.toFixed(2)),
      },
    };
  }

  async getModuleWiseReport(financialYear?: number) {
    const data = await this.reportsRepository.getModuleWiseReport(financialYear);

    return {
      data: data.map((item: any) => ({
        module: item._id || 'Unknown',
        count: item.count || 0,
        totalVendorCost: Number(item.vendorCost || 0),
        totalCustomerAmount: Number(item.customerAmount || 0),
        totalMargin: Number(item.margin || 0),
      })),
    };
  }

  async getStaffPerformanceReport(financialYear?: number) {
    return this.reportsRepository.getStaffPerformanceReport(financialYear);
  }

  async getGSTReport(financialYear?: number) {
    const data = await this.reportsRepository.getGSTReport(financialYear);

    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    const totalGST = data.reduce((sum, item) => sum + item.gst, 0);

    return {
      data,
      summary: {
        totalInvoiceAmount: totalAmount,
        totalGST,
        totalWithGST: totalAmount + totalGST,
      },
    };
  }

  async getDashboardStats(financialYear?: number) {
    return this.reportsRepository.getDashboardStats(financialYear);
  }
}
