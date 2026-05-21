export class AppException extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'AppException';
  }
}

export class BadRequestException extends AppException {
  constructor(message: string, errorCode?: string) {
    super(400, message, errorCode || 'BAD_REQUEST');
    this.name = 'BadRequestException';
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: string = 'Unauthorized', errorCode?: string) {
    super(401, message, errorCode || 'UNAUTHORIZED');
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends AppException {
  constructor(message: string = 'Forbidden', errorCode?: string) {
    super(403, message, errorCode || 'FORBIDDEN');
    this.name = 'ForbiddenException';
  }
}

export class NotFoundException extends AppException {
  constructor(resource: string, errorCode?: string) {
    super(404, `${resource} not found`, errorCode || 'NOT_FOUND');
    this.name = 'NotFoundException';
  }
}

export class ConflictException extends AppException {
  constructor(message: string, errorCode?: string) {
    super(409, message, errorCode || 'CONFLICT');
    this.name = 'ConflictException';
  }
}

export class InternalServerException extends AppException {
  constructor(message: string = 'Internal Server Error', errorCode?: string) {
    super(500, message, errorCode || 'INTERNAL_ERROR');
    this.name = 'InternalServerException';
  }
}

export class ValidationException extends AppException {
  constructor(
    public errors: Record<string, string[]>,
    message: string = 'Validation failed'
  ) {
    super(422, message, 'VALIDATION_ERROR');
    this.name = 'ValidationException';
  }
}
