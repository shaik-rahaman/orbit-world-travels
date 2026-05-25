import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { QUERY_KEYS } from '@/constants';
import { AxiosError } from 'axios';

// Auth hooks
export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.login(email, password),
    onError: (error: AxiosError<any>) => {
      console.error('Login error:', error.response?.data?.error?.message);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: any) => apiClient.register(data),
    onError: (error: AxiosError<any>) => {
      console.error('Register error:', error.response?.data?.error?.message);
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: [QUERY_KEYS.AUTH],
    queryFn: () => apiClient.getCurrentUser(),
    enabled: false,
  });
}

// User management hooks (admin only)
export function useUsers(page = 1, limit = 10, enabled = true) {
  return useQuery({
    queryKey: ['USERS', page, limit],
    queryFn: () => apiClient.getAllUsers(page, limit),
    staleTime: 1000 * 60 * 5,
    enabled: enabled, // Only fetch if enabled (e.g., user is admin)
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['USERS'] });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['USERS'] });
    },
  });
}

export function useDeleteUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['USERS'] });
    },
  });
}

// Visa hooks
export function useVisas(page = 1, limit = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.VISAS, page, limit],
    queryFn: () => apiClient.getVisas(page, limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useVisa(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.VISAS, id],
    queryFn: () => apiClient.getVisaById(id),
  });
}

export function useCreateVisa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createVisa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VISAS] });
    },
  });
}

export function useUpdateVisa(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.updateVisa(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VISAS, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VISAS] });
    },
  });
}

export function useDeleteVisa(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.deleteVisa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VISAS] });
    },
  });
}

// Flight hooks
export function useFlights(page = 1, limit = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.FLIGHTS, page, limit],
    queryFn: () => apiClient.getFlights(page, limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useFlight(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.FLIGHTS, id],
    queryFn: () => apiClient.getFlightById(id),
  });
}

export function useCreateFlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createFlight(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FLIGHTS] });
    },
  });
}

export function useUpdateFlight(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.updateFlight(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FLIGHTS, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FLIGHTS] });
    },
  });
}

export function useDeleteFlight(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.deleteFlight(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FLIGHTS] });
    },
  });
}

// Hotel hooks
export function useHotels(page = 1, limit = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.HOTELS, page, limit],
    queryFn: () => apiClient.getHotels(page, limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useHotel(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.HOTELS, id],
    queryFn: () => apiClient.getHotelById(id),
  });
}

export function useCreateHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createHotel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HOTELS] });
    },
  });
}

export function useUpdateHotel(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.updateHotel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HOTELS, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HOTELS] });
    },
  });
}

export function useDeleteHotel(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.deleteHotel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HOTELS] });
    },
  });
}

// Insurance hooks
export function useInsurance(page = 1, limit = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.INSURANCE, page, limit],
    queryFn: () => apiClient.getInsurance(page, limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useInsuranceById(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.INSURANCE, id],
    queryFn: () => apiClient.getInsuranceById(id),
  });
}

export function useCreateInsurance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createInsurance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSURANCE] });
    },
  });
}

export function useUpdateInsurance(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.updateInsurance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSURANCE, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSURANCE] });
    },
  });
}

export function useDeleteInsurance(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.deleteInsurance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSURANCE] });
    },
  });
}

// Client hooks
export function useClients(page = 1, limit = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.CLIENTS, page, limit],
    queryFn: () => apiClient.getClients(page, limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CLIENTS, id],
    queryFn: () => apiClient.getClientById(id),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLIENTS] });
    },
  });
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLIENTS, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLIENTS] });
    },
  });
}

export function useDeleteClient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLIENTS] });
    },
  });
}

// Invoice hooks
export function useInvoices(page = 1, limit = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVOICES, page, limit],
    queryFn: () => apiClient.getInvoices(page, limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVOICES, id],
    queryFn: () => apiClient.getInvoiceById(id),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES] });
    },
  });
}

export function useAddInvoiceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: any }) => apiClient.addInvoiceItem(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES] });
    },
  });
}

export function useUpdateInvoice(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES] });
    },
  });
}

export function useDeleteInvoice(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES] });
    },
  });
}

// Chatbot hook
export function useSendChatMessage() {
  return useMutation({
    mutationFn: ({ question, searchMode }: { question: string; searchMode?: string }) =>
      apiClient.sendChatMessage(question, searchMode || 'hybrid'),
  });
}

// File Upload hooks
export function useUploadVisaFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: File | { file: File; clientId: string }) => {
      const isFile = data instanceof File;
      const file = isFile ? data : data.file;
      const clientId = isFile ? undefined : data.clientId;
      return apiClient.uploadAndExtractVisa(file, clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VISAS] });
    },
  });
}

export function useUploadFlightFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: File | { file: File; clientId: string }) => {
      const isFile = data instanceof File;
      const file = isFile ? data : data.file;
      const clientId = isFile ? undefined : data.clientId;
      return apiClient.uploadAndExtractFlight(file, clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FLIGHTS] });
    },
  });
}

export function useUploadHotelFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: File | { file: File; clientId: string }) => {
      const isFile = data instanceof File;
      const file = isFile ? data : data.file;
      const clientId = isFile ? undefined : data.clientId;
      return apiClient.uploadAndExtractHotel(file, clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HOTELS] });
    },
  });
}

export function useUploadInsuranceFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: File | { file: File; clientId: string }) => {
      const isFile = data instanceof File;
      const file = isFile ? data : data.file;
      const clientId = isFile ? undefined : data.clientId;
      return apiClient.uploadAndExtractInsurance(file, clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSURANCE] });
    },
  });
}

export function useUploadInvoiceFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: File | { file: File; clientId: string }) => {
      const isFile = data instanceof File;
      const file = isFile ? data : data.file;
      const clientId = isFile ? undefined : data.clientId;
      return apiClient.uploadAndExtractInvoice(file, clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES] });
    },
  });
}

export function useUploadInvoiceDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, file }: { invoiceId: string; file: File }) => apiClient.uploadInvoiceDocument(invoiceId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES] });
    },
  });
}

// Reports hooks
export function useProfitReport(financialYear?: number) {
  return useQuery({
    queryKey: ['PROFIT_REPORT', financialYear],
    queryFn: () => apiClient.getProfitReport(financialYear),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSalesReport(financialYear?: number) {
  return useQuery({
    queryKey: ['SALES_REPORT', financialYear],
    queryFn: () => apiClient.getSalesReport(financialYear),
    staleTime: 1000 * 60 * 5,
  });
}

export function useModuleWiseReport(financialYear?: number) {
  return useQuery({
    queryKey: ['MODULE_WISE_REPORT', financialYear],
    queryFn: () => apiClient.getModuleWiseReport(financialYear),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDashboardStats(financialYear?: number) {
  return useQuery({
    queryKey: ['DASHBOARD_STATS', financialYear],
    queryFn: () => apiClient.getDashboardStats(financialYear),
    staleTime: 1000 * 60 * 1, // Refresh more frequently for dashboard
  });
}

export function useStaffPerformanceReport(financialYear?: number) {
  return useQuery({
    queryKey: ['STAFF_PERFORMANCE', financialYear],
    queryFn: () => apiClient.getStaffPerformanceReport(financialYear),
    staleTime: 1000 * 60 * 5,
  });
}
