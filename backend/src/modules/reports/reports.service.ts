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
      (sum, item) => sum + Number(item.totalCustomerAmount || 0),
      0
    );

    // Aggregate by month for trend data
    const monthlyData: Record<string, any> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    data.forEach((item: any) => {
      const date = new Date(item.createdAt);
      const month = monthNames[date.getMonth()];
      if (!monthlyData[month]) {
        monthlyData[month] = { month, revenue: 0, count: 0 };
      }
      monthlyData[month].revenue += Number(item.totalCustomerAmount || 0);
      monthlyData[month].count += 1;
    });

    const trend = Object.values(monthlyData);

    return {
      data,
      trend,
      summary: {
        totalInvoices: data.length,
        totalSales: parseFloat(totalSales.toFixed(2)),
        averageSale: data.length > 0 ? parseFloat((totalSales / data.length).toFixed(2)) : 0,
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
      (sum, item) => sum + Number(item.totalCustomerAmount || 0),
      0
    );
    const totalCost = data.reduce(
      (sum, item) => sum + Number(item.totalVendorCost || 0),
      0
    );
    const totalProfit = data.reduce(
      (sum, item) => sum + Number(item.totalMargin || 0),
      0
    );
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Aggregate by month for trend data
    const monthlyData: Record<string, any> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    data.forEach((item: any) => {
      const date = new Date(item.createdAt);
      const month = monthNames[date.getMonth()];
      if (!monthlyData[month]) {
        monthlyData[month] = { month, profit: 0, revenue: 0, count: 0 };
      }
      monthlyData[month].revenue += Number(item.totalCustomerAmount || 0);
      monthlyData[month].profit += Number(item.totalMargin || 0);
      monthlyData[month].count += 1;
    });

    const trend = Object.values(monthlyData);

    return {
      data,
      trend,
      summary: {
        totalInvoices: data.length,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        profitMargin: parseFloat(profitMargin.toFixed(2)),
      },
    };
  }

  async getModuleWiseReport(financialYear?: number) {
    const data = await this.reportsRepository.getModuleWiseReport(financialYear);

    if (!Array.isArray(data) || data.length === 0) {
      return {
        data: [
          { module: 'VISA', count: 0, revenue: 0, cost: 0, profit: 0, percentage: 0 },
          { module: 'FLIGHT', count: 0, revenue: 0, cost: 0, profit: 0, percentage: 0 },
          { module: 'HOTEL', count: 0, revenue: 0, cost: 0, profit: 0, percentage: 0 },
          { module: 'INSURANCE', count: 0, revenue: 0, cost: 0, profit: 0, percentage: 0 }
        ]
      };
    }

    // Calculate total count
    const totalCount = data.reduce((sum: number, item: any) => sum + (item.count || 0), 0);

    // Map and calculate percentages
    const mappedData = data.map((item: any) => {
      const count = item.count || 0;
      const revenue = Number(item.customerAmount || 0);
      const cost = Number(item.vendorCost || 0);
      const profit = Number(item.margin || 0);
      const percentage = totalCount > 0 ? parseFloat(((count / totalCount) * 100).toFixed(2)) : 0;

      return {
        module: (item._id || 'Unknown').toUpperCase(),
        count,
        revenue: parseFloat(revenue.toFixed(2)),
        cost: parseFloat(cost.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        percentage
      };
    });

    return {
      data: mappedData,
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
    const stats = await this.reportsRepository.getDashboardStats(financialYear);

    // Calculate profit margin
    const profitMargin = stats.totalRevenue > 0 
      ? parseFloat(((stats.totalProfit / stats.totalRevenue) * 100).toFixed(2))
      : 0;

    // Calculate average order value (total revenue / total finalized invoices)
    const totalOrders = stats.finalizedInvoices;
    const avgOrderValue = totalOrders > 0
      ? parseFloat((stats.totalRevenue / totalOrders).toFixed(2))
      : 0;

    return {
      kpis: {
        totalRevenue: parseFloat(stats.totalRevenue.toFixed(2)),
        totalProfit: parseFloat(stats.totalProfit.toFixed(2)),
        profitMargin,
        avgOrderValue,
        totalTransactions: stats.finalizedInvoices,
        totalInvoices: stats.totalInvoices,
        draftInvoices: stats.draftInvoices,
      },
      salesTrend: [], // Will be populated from sales data if needed
      moduleDistribution: [],
      monthlyRevenue: [],
      topCustomers: []
    };
  }
}
