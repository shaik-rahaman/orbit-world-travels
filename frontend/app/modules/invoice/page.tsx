'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, Button, Table, Pagination, Badge, Modal, Input, Select, FileUpload } from '@/components/shared';
import { useInvoices, useCreateInvoice, useClients, useVisas, useFlights, useHotels, useInsurance, useUploadInvoiceFile, useUploadVisaFile, useUploadFlightFile, useUploadHotelFile, useUploadInsuranceFile, useAddInvoiceItem } from '@/hooks/useApi';
import { usePermissions } from '@/hooks/usePermissions';
import { PAGINATION, INVOICE_STATUSES } from '@/constants';
import { formatCurrency } from '@/utils/helpers';
import { Plus, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

function InvoiceListContent() {
  const queryClient = useQueryClient();
  const { canCreate } = usePermissions();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'extracting' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [moduleType, setModuleType] = useState<'INVOICE' | 'VISA' | 'FLIGHT' | 'HOTEL' | 'INSURANCE'>('INVOICE');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    clientId: '',
    status: 'DRAFT',
    items: [] as Array<{ moduleType: 'VISA' | 'FLIGHT' | 'HOTEL' | 'INSURANCE'; recordId: string; amount: number }>,
  });
  const [selectedItemsForClient, setSelectedItemsForClient] = useState<any[]>([]);

  const { data, isPending, refetch } = useInvoices(page, PAGINATION.DEFAULT_LIMIT);
  const { data: clientsData, isPending: isLoadingClients } = useClients(1, 1000);
  const { data: visasData } = useVisas(1, 1000);
  const { data: flightsData } = useFlights(1, 1000);
  const { data: hotelsData } = useHotels(1, 1000);
  const { data: insuranceData } = useInsurance(1, 1000);
  const { mutate: createInvoice, isPending: isCreating } = useCreateInvoice();
  const { mutate: addInvoiceItem } = useAddInvoiceItem();
  const { mutate: uploadInvoice, isPending: isUploadingInvoice } = useUploadInvoiceFile();
  const { mutate: uploadVisa, isPending: isUploadingVisa } = useUploadVisaFile();
  const { mutate: uploadFlight, isPending: isUploadingFlight } = useUploadFlightFile();
  const { mutate: uploadHotel, isPending: isUploadingHotel } = useUploadHotelFile();
  const { mutate: uploadInsurance, isPending: isUploadingInsurance } = useUploadInsuranceFile();

  const clientOptions = clientsData?.data?.data?.map((c: any) => ({ value: c._id, label: c.name })) || [];
  const hasClients = clientOptions.length > 0;

  // Auto-populate available items when client is selected
  useEffect(() => {
    if (!formData.clientId) {
      setSelectedItemsForClient([]);
      setFormData(prev => ({ ...prev, items: [] }));
      return;
    }

    const items: any[] = [];
    
    // Add visas for this client
    visasData?.data?.data?.forEach((visa: any) => {
      if (visa.clientId === formData.clientId && visa.status !== 'REJECTED') {
        items.push({
          moduleType: 'VISA',
          recordId: visa._id,
          amount: visa.customerAmount,
          label: `Visa - ${visa.applicantName} (${visa.country}) - ${formatCurrency(visa.customerAmount)}`,
        });
      }
    });

    // Add flights for this client
    flightsData?.data?.data?.forEach((flight: any) => {
      if (flight.clientId === formData.clientId) {
        items.push({
          moduleType: 'FLIGHT',
          recordId: flight._id,
          amount: flight.customerAmount,
          label: `Flight - ${flight.airline} ${flight.flightNumber} - ${formatCurrency(flight.customerAmount)}`,
        });
      }
    });

    // Add hotels for this client
    hotelsData?.data?.data?.forEach((hotel: any) => {
      if (hotel.clientId === formData.clientId) {
        items.push({
          moduleType: 'HOTEL',
          recordId: hotel._id,
          amount: hotel.customerAmount,
          label: `Hotel - ${hotel.hotelName} (${hotel.city}) - ${formatCurrency(hotel.customerAmount)}`,
        });
      }
    });

    // Add insurance for this client
    insuranceData?.data?.data?.forEach((insurance: any) => {
      if (insurance.clientId === formData.clientId) {
        items.push({
          moduleType: 'INSURANCE',
          recordId: insurance._id,
          amount: insurance.customerAmount,
          label: `Insurance - ${insurance.policyType} - ${formatCurrency(insurance.customerAmount)}`,
        });
      }
    });

    setSelectedItemsForClient(items);
  }, [formData.clientId, visasData, flightsData, hotelsData, insuranceData]);

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #', width: '18%' },
    { 
      key: 'clientId', 
      label: 'Client', 
      width: '22%',
      render: (clientId: string) => {
        const client = clientsData?.data?.data?.find((c: any) => c._id === clientId);
        return client?.name || 'Unknown';
      }
    },
    { key: 'vendorCost', label: 'Subtotal', width: '14%', align: 'right' as const, render: (v: number) => formatCurrency(v || 0) },
    { key: 'margin', label: 'Margin', width: '14%', align: 'right' as const, render: (v: number) => formatCurrency(v || 0) },
    { key: 'totalAmount', label: 'Total', width: '16%', align: 'right' as const, render: (v: number) => formatCurrency(v || 0) },
    { key: 'status', label: 'Status', width: '12%', render: (v: string) => <Badge status={v}>{v}</Badge> },
  ];

  const handleToggleItem = (item: any) => {
    const exists = formData.items.find(i => i.recordId === item.recordId);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(i => i.recordId !== item.recordId),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          moduleType: item.moduleType,
          recordId: item.recordId,
          amount: item.amount,
        }],
      }));
    }
  };

  const handleFileUpload = (file: File) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Validate that a client is selected before uploading
        if (!formData.clientId) {
          setUploadError('Please select a client before uploading a document');
          reject(new Error('No client selected'));
          return;
        }

        setUploadStatus('extracting');
        setUploadError('');

        const commonHandlers = {
          onSuccess: (response: any) => {
            const extractedData = response.data?.extractedData || response.data;

            // Preserve extracted data for later use
            setExtractedData(extractedData);
            setUploadedFile(file);

            // Keep uploadStatus as 'success' for invoice creation validation
            setUploadStatus('success');
            resolve(response);
          },
          onError: (error: any) => {
            setUploadStatus('error');
            // Extract error message from various response formats
            let errorMsg = 'Failed to extract document data';
            
            if (error.response?.data?.error?.message) {
              errorMsg = error.response.data.error.message;
            } else if (error.response?.data?.message) {
              errorMsg = error.response.data.message;
            } else if (error.response?.data?.error?.errors?.clientId) {
              // Handle Joi validation errors
              errorMsg = error.response.data.error.errors.clientId[0] || errorMsg;
            } else if (error.message) {
              errorMsg = error.message;
            }
            
            setUploadError(errorMsg);
            reject(error);
          },
        } as any;

        // Route to appropriate upload hook by selected moduleType
        // Pass clientId and file as an object
        switch (moduleType) {
          case 'VISA':
            uploadVisa({ file, clientId: formData.clientId }, commonHandlers);
            break;
          case 'FLIGHT':
            uploadFlight({ file, clientId: formData.clientId }, commonHandlers);
            break;
          case 'HOTEL':
            uploadHotel({ file, clientId: formData.clientId }, commonHandlers);
            break;
          case 'INSURANCE':
            uploadInsurance({ file, clientId: formData.clientId }, commonHandlers);
            break;
          default:
            uploadInvoice({ file, clientId: formData.clientId }, commonHandlers);
            break;
        }
      } catch (err) {
        setUploadStatus('error');
        setUploadError('Upload failed');
        reject(err);
      }
    });
  };

  const handleCreateInvoice = () => {
    setError('');
    
    if (!formData.clientId) {
      setError('Please select a client');
      return;
    }

    // Invoice can be created if:
    // 1. Items are manually selected, OR
    // 2. A document was successfully uploaded for extraction
    const hasSelectedItems = formData.items.length > 0;
    const hasSuccessfulUpload = uploadStatus === 'success' && extractedData;

    if (!hasSelectedItems && !hasSuccessfulUpload) {
      setError('Please select at least one item for the invoice or upload a document');
      return;
    }

    const payload = {
      financialYear: new Date().getFullYear(),
      clientId: formData.clientId,
      notes: '',
    };

    createInvoice(payload, {
      onSuccess: async (response: any) => {
        const createdInvoice = response.data;
        // If items were selected, add them as line items sequentially
        try {
          for (const item of formData.items) {
            await new Promise((resolve, reject) => {
              addInvoiceItem({ invoiceId: createdInvoice.id, data: { moduleType: item.moduleType, referenceId: item.recordId } }, {
                onSuccess: () => resolve(true),
                onError: (err: any) => reject(err),
              });
            });
          }
        } catch (err) {
          // Log and continue — invoice was created but some items may have failed to attach
          console.error('Failed to attach some invoice items', err);
        }

        // If a file was uploaded earlier, attach it to the created invoice
        if (uploadedFile) {
          try {
            // call apiClient.uploadInvoiceDocument directly to attach file
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { apiClient } = await import('@/services/apiClient');
            await apiClient.uploadInvoiceDocument(createdInvoice.id, uploadedFile);
          } catch (err) {
            console.error('Failed to attach uploaded document to invoice', err);
          }
        }

        setIsModalOpen(false);
        setFormData({ clientId: '', status: 'DRAFT', items: [] });
        setSelectedItemsForClient([]);
        setError('');
        setUploadStatus('idle');
        setUploadedFile(null);
        setExtractedData(null);
        refetch();
      },
      onError: (error: any) => {
        setError(error.response?.data?.error?.message || 'Failed to create invoice');
      },
    });
  };

  const handleClearUpload = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setUploadStatus('idle');
    setUploadError('');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-gray-600 mt-1">Create and manage invoices for clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCw size={20} /> Refresh
          </Button>
          {canCreate && (
            <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <Plus size={20} /> New Invoice
            </Button>
          )}
        </div>
      </div>

      <Card>
        {data?.data?.data?.length ? (
          <>
            <Table columns={columns} data={data.data.data} isLoading={isPending} />
            {data?.data?.pagination && (
              <Pagination page={page} totalPages={data.data.pagination.totalPages} onPageChange={setPage} isLoading={isPending} />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No invoices found. Create one to get started.</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        title="Create New Invoice"
        onClose={() => {
          setIsModalOpen(false);
          setError('');
        }}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setError('');
            }}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleCreateInvoice} 
              isLoading={isCreating} 
              disabled={!hasClients || isLoadingClients || !formData.clientId}
              title={!formData.clientId ? "Please select a client first" : ""}
            >
              Create Invoice
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
              <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
          )}

          {isLoadingClients && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">Loading clients...</p>
            </div>
          )}

          {!isLoadingClients && !hasClients && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-2">
              <AlertCircle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">No Clients Found</p>
                <p className="text-xs text-yellow-700">Please create a client in the CRM module before creating an invoice.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year</label>
              <Input
                type="number"
                value={new Date().getFullYear()}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-set to current year</p>
            </div>
            <Select
              label="Client *"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              options={clientOptions}
              disabled={isLoadingClients || !hasClients}
              required
            />
          </div>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            options={INVOICE_STATUSES.map((s) => ({ value: s, label: s }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Invoice (optional)</label>
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Module Type"
                  value={moduleType}
                  onChange={(e) => setModuleType(e.target.value as any)}
                  options={[
                    { value: 'INVOICE', label: 'Invoice' },
                    { value: 'VISA', label: 'Visa' },
                    { value: 'FLIGHT', label: 'Flight' },
                    { value: 'HOTEL', label: 'Hotel' },
                    { value: 'INSURANCE', label: 'Insurance' },
                  ]}
                />
                <div />
              </div>
              <FileUpload onUpload={handleFileUpload} label="Upload Invoice Document" />
              
              {uploadStatus === 'extracting' && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <p className="text-xs text-blue-800">Extracting document data...</p>
                </div>
              )}
              
              {uploadStatus === 'error' && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-red-600">{uploadError}</p>
                  </div>
                </div>
              )}
              
              {uploadStatus === 'success' && uploadedFile && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-green-800">Document uploaded successfully</p>
                      <p className="text-xs text-green-700">{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)</p>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={handleClearUpload}
                    className="ml-2 text-xs py-1 px-2"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </div>

          {formData.clientId && selectedItemsForClient.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Invoice Items</label>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                {selectedItemsForClient.map((item) => (
                  <div key={`${item.moduleType}-${item.recordId}`} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.items.some(i => i.recordId === item.recordId)}
                      onChange={() => handleToggleItem(item)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700 flex-1">{item.label}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.clientId && selectedItemsForClient.length === 0 && uploadStatus !== 'success' && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">No items available for this client. Create some bookings first, or upload a document above to extract data.</p>
            </div>
          )}

          {!formData.clientId && hasClients && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">Select a client to see available items.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <InvoiceListContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
