// Auth Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'STAFF' | 'DEMO';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

// Visa Types
export interface Visa {
  id: string;
  applicantName: string;
  country: string;
  visaType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  vendorCost: number;
  customerAmount: number;
  margin: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  clientId: string;
}

// Flight Types
export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  pnr: string;
  sector: string;
  passengerName: string;
  departureDate: string;
  returnDate: string;
  vendorCost: number;
  customerAmount: number;
  margin: number;
  createdAt: string;
  updatedAt: string;
  clientId: string;
}

// Hotel Types
export interface Hotel {
  id: string;
  hotelName: string;
  city: string;
  roomType: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  vendorCost: number;
  customerAmount: number;
  margin: number;
  createdAt: string;
  updatedAt: string;
  clientId: string;
}

// Insurance Types
export interface Insurance {
  id: string;
  policyNumber: string;
  insuredName: string;
  policyType: string;
  coverageAmount: number;
  vendorCost: number;
  customerAmount: number;
  margin: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  clientId: string;
}

// Invoice Types
export interface InvoiceItem {
  moduleType: 'VISA' | 'FLIGHT' | 'HOTEL' | 'INSURANCE';
  recordId: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  items: InvoiceItem[];
  subtotal: number;
  totalMargin: number;
  totalAmount: number;
  status: 'DRAFT' | 'SENT' | 'PAID';
  createdAt: string;
  updatedAt: string;
}

// CRM Types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    invoices: number;
    visas: number;
    flights: number;
    hotels: number;
    insurance: number;
  };
}

// Chatbot Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    errors?: Record<string, string[]>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalSales: number;
  totalProfit: number;
  pendingTasks: number;
  totalClients: number;
  recentActivity: Array<{
    id: string;
    action: string;
    module: string;
    timestamp: string;
  }>;
}
