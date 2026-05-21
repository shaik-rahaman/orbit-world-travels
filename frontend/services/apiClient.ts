import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '@/constants';
import { ApiResponse } from '@/types';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    console.log('[API Client] Initializing with baseURL:', API_BASE_URL);
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token and logging
    this.instance.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('[API Request]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        timestamp: new Date().toISOString(),
      });
      return config;
    });

    // Response interceptor for error handling and logging
    this.instance.interceptors.response.use(
      (response) => {
        console.log('[API Response]', {
          status: response.status,
          url: response.config.url,
          data: response.data,
          timestamp: new Date().toISOString(),
        });
        return response;
      },
      (error: AxiosError) => {
        try {
          const errorInfo = {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method,
            message: error.message,
            errorData: error.response?.data,
            code: error.code,
            timestamp: new Date().toISOString(),
          };
          
          console.error('[API Error] Status:', error.response?.status);
          console.error('[API Error] Message:', error.message);
          console.error('[API Error] URL:', error.config?.url);
          console.error('[API Error] Response Data:', error.response?.data);
          console.error('[API Error] Full Info:', JSON.stringify(errorInfo, null, 2));
        } catch (logError) {
          console.error('[API Error - Logging Failed]:', logError);
          console.error('[API Error - Raw]:', error);
        }
        
        if (error.response?.status === 401) {
          // Clear auth and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    return this.instance.post('/auth/login', { email, password });
  }

  async register(data: any): Promise<ApiResponse<any>> {
    return this.instance.post('/auth/register', data);
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.instance.get('/auth/me');
  }

  // Visa endpoints
  async getVisas(page = 1, limit = 10): Promise<ApiResponse<any>> {
    return this.instance.get(`/visa?page=${page}&limit=${limit}`);
  }

  async getVisaById(id: string): Promise<ApiResponse<any>> {
    return this.instance.get(`/visa/${id}`);
  }

  async createVisa(data: any): Promise<ApiResponse<any>> {
    return this.instance.post('/visa', data);
  }

  async updateVisa(id: string, data: any): Promise<ApiResponse<any>> {
    return this.instance.put(`/visa/${id}`, data);
  }

  async deleteVisa(id: string): Promise<ApiResponse<any>> {
    return this.instance.delete(`/visa/${id}`);
  }

  // Flight endpoints
  async getFlights(page = 1, limit = 10): Promise<ApiResponse<any>> {
    return this.instance.get(`/flight?page=${page}&limit=${limit}`);
  }

  async getFlightById(id: string): Promise<ApiResponse<any>> {
    return this.instance.get(`/flight/${id}`);
  }

  async createFlight(data: any): Promise<ApiResponse<any>> {
    return this.instance.post('/flight', data);
  }

  async updateFlight(id: string, data: any): Promise<ApiResponse<any>> {
    return this.instance.put(`/flight/${id}`, data);
  }

  async deleteFlight(id: string): Promise<ApiResponse<any>> {
    return this.instance.delete(`/flight/${id}`);
  }

  // Hotel endpoints
  async getHotels(page = 1, limit = 10): Promise<ApiResponse<any>> {
    return this.instance.get(`/hotel?page=${page}&limit=${limit}`);
  }

  async getHotelById(id: string): Promise<ApiResponse<any>> {
    return this.instance.get(`/hotel/${id}`);
  }

  async createHotel(data: any): Promise<ApiResponse<any>> {
    return this.instance.post('/hotel', data);
  }

  async updateHotel(id: string, data: any): Promise<ApiResponse<any>> {
    return this.instance.put(`/hotel/${id}`, data);
  }

  async deleteHotel(id: string): Promise<ApiResponse<any>> {
    return this.instance.delete(`/hotel/${id}`);
  }

  // Insurance endpoints
  async getInsurance(page = 1, limit = 10): Promise<ApiResponse<any>> {
    return this.instance.get(`/insurance?page=${page}&limit=${limit}`);
  }

  async getInsuranceById(id: string): Promise<ApiResponse<any>> {
    return this.instance.get(`/insurance/${id}`);
  }

  async createInsurance(data: any): Promise<ApiResponse<any>> {
    return this.instance.post('/insurance', data);
  }

  async updateInsurance(id: string, data: any): Promise<ApiResponse<any>> {
    return this.instance.put(`/insurance/${id}`, data);
  }

  async deleteInsurance(id: string): Promise<ApiResponse<any>> {
    return this.instance.delete(`/insurance/${id}`);
  }

  // Client endpoints
  async getClients(page = 1, limit = 10): Promise<ApiResponse<any>> {
    return this.instance.get(`/clients?page=${page}&limit=${limit}`);
  }

  async getClientById(id: string): Promise<ApiResponse<any>> {
    return this.instance.get(`/clients/${id}`);
  }

  async createClient(data: any): Promise<ApiResponse<any>> {
    return this.instance.post('/clients', data);
  }

  async updateClient(id: string, data: any): Promise<ApiResponse<any>> {
    return this.instance.put(`/clients/${id}`, data);
  }

  async deleteClient(id: string): Promise<ApiResponse<any>> {
    return this.instance.delete(`/clients/${id}`);
  }

  // Invoice endpoints
  async getInvoices(page = 1, limit = 10): Promise<ApiResponse<any>> {
    return this.instance.get(`/invoices?page=${page}&limit=${limit}`);
  }

  async getInvoiceById(id: string): Promise<ApiResponse<any>> {
    return this.instance.get(`/invoices/${id}`);
  }

  async createInvoice(data: any): Promise<ApiResponse<any>> {
    return this.instance.post('/invoices', data);
  }

  async uploadInvoiceDocument(invoiceId: string, file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('document', file);
    return this.instance.post(`/invoices/${invoiceId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async addInvoiceItem(invoiceId: string, data: any): Promise<ApiResponse<any>> {
    return this.instance.post(`/invoices/${invoiceId}/items`, data);
  }

  async updateInvoice(id: string, data: any): Promise<ApiResponse<any>> {
    return this.instance.put(`/invoices/${id}`, data);
  }

  async deleteInvoice(id: string): Promise<ApiResponse<any>> {
    return this.instance.delete(`/invoices/${id}`);
  }

  // Reports endpoints
  async getReports(startDate: string, endDate: string): Promise<ApiResponse<any>> {
    return this.instance.get(`/reports?startDate=${startDate}&endDate=${endDate}`);
  }

  // Chatbot endpoints
  async sendChatMessage(message: string, searchMode: string = 'hybrid'): Promise<ApiResponse<any>> {
    const payload = { question: message, searchMode };
    try {
      console.log('Chat request payload:', payload);
      const resp = await this.instance.post('/ai/chat', payload);
      console.log('Chat response:', resp?.data);
      return resp.data;
    } catch (err) {
      console.error('Chat API error:', err);
      throw err;
    }
  }

  // Helper method to get default client ID (can be extended to get from context)
  private getClientId(): string {
    // TODO: Get from user context or allow passing it as parameter
    return 'default-client-id';
  }

  // File upload endpoints
  async uploadAndExtractVisa(file: File, clientId?: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('moduleType', 'VISA');
    if (clientId) formData.append('clientId', clientId);
    return this.instance.post('/ai/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async uploadAndExtractFlight(file: File, clientId?: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('moduleType', 'FLIGHT');
    if (clientId) formData.append('clientId', clientId);
    return this.instance.post('/ai/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async uploadAndExtractHotel(file: File, clientId?: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('moduleType', 'HOTEL');
    if (clientId) formData.append('clientId', clientId);
    return this.instance.post('/ai/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async uploadAndExtractInsurance(file: File, clientId?: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('moduleType', 'INSURANCE');
    if (clientId) formData.append('clientId', clientId);
    return this.instance.post('/ai/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async uploadAndExtractInvoice(file: File, clientId?: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('moduleType', 'INVOICE');
    if (clientId) formData.append('clientId', clientId);
    return this.instance.post('/ai/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // User management endpoints (admin only)
  async getAllUsers(page = 1, limit = 10): Promise<ApiResponse<any>> {
    return this.instance.get(`/auth/users?page=${page}&limit=${limit}`);
  }

  async createUser(data: any): Promise<ApiResponse<any>> {
    return this.instance.post('/auth/register', data);
  }

  async updateUser(id: string, data: any): Promise<ApiResponse<any>> {
    return this.instance.put(`/auth/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<ApiResponse<any>> {
    return this.instance.delete(`/auth/users/${id}`);
  }

  // Reports endpoints
  async getProfitReport(financialYear?: number, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    let url = '/reports/profit';
    const params: string[] = [];
    if (financialYear) params.push(`financialYear=${financialYear}`);
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length) url += '?' + params.join('&');
    return this.instance.get(url);
  }

  async getSalesReport(financialYear?: number, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    let url = '/reports/sales';
    const params: string[] = [];
    if (financialYear) params.push(`financialYear=${financialYear}`);
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length) url += '?' + params.join('&');
    return this.instance.get(url);
  }

  async getModuleWiseReport(financialYear?: number): Promise<ApiResponse<any>> {
    let url = '/reports/module-wise';
    if (financialYear) url += `?financialYear=${financialYear}`;
    return this.instance.get(url);
  }

  async getDashboardStats(financialYear?: number): Promise<ApiResponse<any>> {
    let url = '/reports/dashboard';
    if (financialYear) url += `?financialYear=${financialYear}`;
    return this.instance.get(url);
  }

  async getStaffPerformanceReport(financialYear?: number): Promise<ApiResponse<any>> {
    let url = '/reports/staff-performance';
    if (financialYear) url += `?financialYear=${financialYear}`;
    return this.instance.get(url);
  }
}

export const apiClient = new ApiClient();
