import mongoose, { Schema, Document } from 'mongoose';

// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  DEMO = 'DEMO',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  FINALIZED = 'FINALIZED',
  CANCELLED = 'CANCELLED',
}

export enum VisaStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export enum ModuleType {
  VISA = 'VISA',
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  INSURANCE = 'INSURANCE',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

// Interfaces extending Document
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClient extends Document {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  createdBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    invoices: number;
    visas: number;
    flights: number;
    hotels: number;
    insurance: number;
  };
}

export interface IInvoiceItem extends Document {
  invoiceId: Schema.Types.ObjectId;
  moduleType: ModuleType;
  moduleRecordId: Schema.Types.ObjectId;
  amount?: number;
  vendorCost?: number;
  customerAmount?: number;
  margin?: number;
  createdAt: Date;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  clientId: Schema.Types.ObjectId;
  status: InvoiceStatus;
  vendorCost: number;
  customerAmount: number;
  margin: number;
  gst: number;
  totalAmount: number;
  financialYear: string;
  description?: string;
  items: Schema.Types.ObjectId[];
  documents?: Array<{
    filename: string;
    originalName: string;
    path: string;
    uploadedAt: Date;
    uploadedBy?: Schema.Types.ObjectId;
  }>;
  createdBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  finalizedAt?: Date;
}

export interface IVisa extends Document {
  applicantName: string;
  applicantEmail?: string;
  gender: Gender;
  dateOfBirth?: Date;
  passportNumber: string;
  visaType: string;
  country: string;
  status: VisaStatus;
  applicationDate: Date;
  approvalDate?: Date;
  cost: number;
  sellingPrice: number;
  margin: number;
  clientId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFlight extends Document {
  pnr: string;
  passengerName: string;
  passengerEmail?: string;
  airline: string;
  flightNumber: string;
  sector: string;
  departureDate: Date;
  returnDate?: Date;
  seatClass: string;
  cost: number;
  sellingPrice: number;
  margin: number;
  clientId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHotel extends Document {
  guestName: string;
  guestEmail?: string;
  hotelName: string;
  city: string;
  roomType: string;
  checkInDate: Date;
  checkOutDate: Date;
  noOfNights: number;
  cost: number;
  sellingPrice: number;
  margin: number;
  clientId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInsurance extends Document {
  policyNumber: string;
  holderName: string;
  holderEmail?: string;
  insuranceType: string;
  coverageAmount: number;
  duration: number;
  cost: number;
  sellingPrice: number;
  margin: number;
  clientId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.STAFF },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const clientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    address: String,
    city: String,
    country: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    moduleType: { type: String, enum: Object.values(ModuleType), required: true },
    moduleRecordId: { type: Schema.Types.ObjectId, required: true },
    // Store both vendor and customer amounts for better traceability
    vendorCost: { type: Number },
    customerAmount: { type: Number },
      margin: { type: Number },
    amount: { type: Number },
  },
  { timestamps: true }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: Object.values(InvoiceStatus), default: InvoiceStatus.DRAFT },
    vendorCost: { type: Number, required: true },
    customerAmount: { type: Number, required: true },
    margin: Number,
    gst: Number,
    totalAmount: Number,
    financialYear: { type: String, required: true },
    description: String,
    items: [{ type: Schema.Types.ObjectId, ref: 'InvoiceItem' }],
    documents: [
      {
        filename: String,
        originalName: String,
        path: String,
        uploadedAt: Date,
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    finalizedAt: Date,
  },
  { timestamps: true }
);

const visaSchema = new Schema<IVisa>(
  {
    applicantName: { type: String, required: true },
    applicantEmail: String,
    gender: { type: String, enum: Object.values(Gender) },
    dateOfBirth: Date,
    passportNumber: { type: String, required: true },
    visaType: { type: String, required: true },
    country: { type: String, required: true },
    status: { type: String, enum: Object.values(VisaStatus), default: VisaStatus.PENDING },
    applicationDate: { type: Date, default: Date.now },
    approvalDate: Date,
    cost: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    margin: Number,
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  },
  { timestamps: true }
);

const flightSchema = new Schema<IFlight>(
  {
    pnr: { type: String, required: true, unique: true },
    passengerName: { type: String, required: true },
    passengerEmail: String,
    airline: { type: String, required: true },
    flightNumber: { type: String, required: true },
    sector: { type: String, required: true },
    departureDate: { type: Date },
    returnDate: Date,
    seatClass: { type: String, default: 'ECONOMY' },
    cost: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    margin: Number,
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  },
  { timestamps: true }
);

const hotelSchema = new Schema<IHotel>(
  {
    guestName: { type: String, required: true },
    guestEmail: String,
    hotelName: { type: String, required: true },
    city: { type: String, required: true },
    roomType: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    noOfNights: Number,
    cost: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    margin: Number,
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  },
  { timestamps: true }
);

const insuranceSchema = new Schema<IInsurance>(
  {
    policyNumber: { type: String, required: true, unique: true },
    holderName: { type: String, required: true },
    holderEmail: String,
    insuranceType: { type: String, required: true },
    coverageAmount: { type: Number, required: true },
    duration: { type: Number, required: true },
    cost: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    margin: Number,
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  },
  { timestamps: true }
);

// Models
export const User = mongoose.model<IUser>('User', userSchema);
export const Client = mongoose.model<IClient>('Client', clientSchema);
export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
export const InvoiceItem = mongoose.model<IInvoiceItem>('InvoiceItem', invoiceItemSchema);
export const Visa = mongoose.model<IVisa>('Visa', visaSchema);
export const Flight = mongoose.model<IFlight>('Flight', flightSchema);
export const Hotel = mongoose.model<IHotel>('Hotel', hotelSchema);
export const Insurance = mongoose.model<IInsurance>('Insurance', insuranceSchema);
