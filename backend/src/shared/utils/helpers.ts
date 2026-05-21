export class FinancialYearHelper {
  static getCurrentFinancialYear(): number {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11

    // Financial year typically runs from April to March
    if (currentMonth >= 4) {
      return today.getFullYear();
    }
    return today.getFullYear() - 1;
  }

  static getFinancialYearRange(year: number): {
    startDate: Date;
    endDate: Date;
  } {
    return {
      startDate: new Date(year, 3, 1), // April 1st
      endDate: new Date(year + 1, 2, 31), // March 31st
    };
  }

  static formatInvoiceNumber(financialYear: number, sequence: number): string {
    const year = financialYear.toString().slice(-2); // Last 2 digits of year
    const current = new Date().getFullYear();
    const seq = sequence.toString().padStart(4, '0');
    return `OR-${current}${year}/${seq}`;
  }
}

type Decimal = any;

export class MarginCalculator {
  static calculateMargin(
    customerAmount: number | Decimal,
    vendorCost: number | Decimal
  ): Decimal {
    // Use plain number arithmetic to avoid external dependency on decimal.js
    const customer = typeof customerAmount === 'number' ? customerAmount : Number(customerAmount);
    const vendor = typeof vendorCost === 'number' ? vendorCost : Number(vendorCost);
    return parseFloat((customer - vendor).toFixed(2));
  }

  static getMarginPercentage(
    margin: number | Decimal,
    customerAmount: number | Decimal
  ): number {
    const m = typeof margin === 'number' ? margin : Number(margin);
    const c = typeof customerAmount === 'number' ? customerAmount : Number(customerAmount);
    if (!c || c === 0) return 0;
    const percentage = (m / c) * 100;
    return parseFloat(percentage.toFixed(2));
  }
}

export class StringHelper {
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = originalName.split('.').pop();
    return `${timestamp}_${random}.${ext}`;
  }
}

export class DateHelper {
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static isBetween(
    date: Date,
    startDate: Date,
    endDate: Date
  ): boolean {
    return date >= startDate && date <= endDate;
  }

  static getMonthRange(month: number, year: number): {
    startDate: Date;
    endDate: Date;
  } {
    return {
      startDate: new Date(year, month - 1, 1),
      endDate: new Date(year, month, 0),
    };
  }
}

export class PaginationHelper {
  static getPagination(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return { skip, take: limit };
  }

  static getPaginationResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ) {
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
