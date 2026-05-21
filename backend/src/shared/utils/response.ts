export class ApiResponseBuilder {
  static success<T>(data: T, message?: string) {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, errorCode?: string, errors?: Record<string, string[]>) {
    return {
      success: false,
      error: {
        message,
        code: errorCode,
        errors,
      },
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(data: T[], total: number, page: number, limit: number) {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export class Logger {
  static info(message: string, meta?: any) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
  }

  static error(message: string, error?: any) {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`,
      error || ''
    );
  }

  static warn(message: string, meta?: any) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
  }

  static debug(message: string, meta?: any) {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta || '');
    }
  }
}
