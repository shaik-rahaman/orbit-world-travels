// UserRole enum
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

// Invoice Status
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  FINALIZED = 'FINALIZED',
  CANCELLED = 'CANCELLED',
}

// Visa Status
export enum VisaStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

// Module Types
export enum ModuleType {
  VISA = 'VISA',
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  INSURANCE = 'INSURANCE',
}

// Gender
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}
