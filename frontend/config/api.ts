/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints supporting both:
 * - Local Development: http://localhost:3008/api/orbit-world
 * - Production (Azure): https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world
 */

// Get API base URL from environment variables with fallback
const getApiBaseUrl = (): string => {
  // Next.js uses NEXT_PUBLIC_ prefix for client-side environment variables
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // Fallback to localhost if no env var is set
  const fallbackUrl = 'http://localhost:3008/api/orbit-world';
  
  const baseUrl = envUrl || fallbackUrl;
  
  // Log API configuration (only in development)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[API Config] Environment:', process.env.NEXT_PUBLIC_ENVIRONMENT || 'unknown');
    console.log('[API Config] Base URL:', baseUrl);
  }
  
  return baseUrl;
};

export const API_CONFIG = {
  // Base URL for all API requests
  baseUrl: getApiBaseUrl(),
  
  // Environment detection
  isDevelopment: typeof window !== 'undefined' ? process.env.NODE_ENV === 'development' : false,
  isProduction: typeof window !== 'undefined' ? process.env.NODE_ENV === 'production' : false,
  
  // API Endpoints (relative paths that get appended to baseUrl)
  endpoints: {
    // Auth
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
    },
    
    // CRM
    clients: '/clients',
    leads: '/crm/leads',
    
    // Visa
    visas: '/visa',
    
    // Flight
    flights: '/flight',
    
    // Hotel
    hotels: '/hotel',
    
    // Insurance
    insurance: '/insurance',
    
    // Invoice
    invoices: '/invoices',
    
    // AI / Chatbot
    chat: '/ai/chat',
    documents: '/ai/documents',
    
    // Reports
    reports: '/reports',
  },
  
  // Request timeout (ms)
  timeout: 30000,
  
  // Retry configuration
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
  },
} as const;

// Export helper function to build full URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};

// Export API base URL for backward compatibility
export const API_BASE_URL = API_CONFIG.baseUrl;

export default API_CONFIG;
