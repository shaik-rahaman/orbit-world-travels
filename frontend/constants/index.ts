export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3008/api/orbit-world';

export const MODULES = [
  { id: 'invoice', name: 'Invoices', path: '/modules/invoice', icon: 'FileText' },
  { id: 'visa', name: 'Visas', path: '/modules/visa', icon: 'Passport' },
  { id: 'flight', name: 'Flights', path: '/modules/flight', icon: 'Plane' },
  { id: 'hotel', name: 'Hotels', path: '/modules/hotel', icon: 'Building' },
  { id: 'insurance', name: 'Insurance', path: '/modules/insurance', icon: 'Shield' },
  { id: 'crm', name: 'CRM', path: '/modules/crm', icon: 'Users' },
  { id: 'reports', name: 'Reports', path: '/modules/reports', icon: 'BarChart3' },
] as const;

export const VISA_TYPES = ['Tourist', 'Business', 'Work', 'Student', 'Transit'];
export const VISA_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

export const ROOM_TYPES = ['Single', 'Double', 'Deluxe', 'Suite', 'Presidential'];

export const INSURANCE_TYPES = ['Travel', 'Medical', 'Flight Delay', 'Trip Cancellation', 'Baggage'];

export const INVOICE_STATUSES = ['DRAFT', 'SENT', 'PAID'];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [10, 25, 50, 100],
};

export const QUERY_KEYS = {
  AUTH: 'auth',
  USERS: 'users',
  VISAS: 'visas',
  FLIGHTS: 'flights',
  HOTELS: 'hotels',
  INSURANCE: 'insurance',
  CLIENTS: 'clients',
  INVOICES: 'invoices',
  DASHBOARD: 'dashboard',
  REPORTS: 'reports',
} as const;
