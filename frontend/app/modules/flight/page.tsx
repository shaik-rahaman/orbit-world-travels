'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';import { ProtectedRoute } from '@/components/auth/ProtectedRoute';import { Card, Button, Table, Pagination, Badge, Modal, Input, FileUpload, Select } from '@/components/shared';
import { useFlights, useCreateFlight, useUploadFlightFile, useClients } from '@/hooks/useApi';
import { usePermissions } from '@/hooks/usePermissions';
import { PAGINATION } from '@/constants';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { Plus, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

function FlightListContent() {
  const queryClient = useQueryClient();
  const { canCreate } = usePermissions();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'extracting' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    airline: '',
    flightNumber: '',
    pnr: '',
    sector: '',
    passengerName: '',
    departureDate: '',
    returnDate: '',
    vendorCost: '',
    customerAmount: '',
    clientId: '',
  });
  const { data: clientsData, isPending: isLoadingClients } = useClients(1, 1000);
  const { data, isPending, refetch } = useFlights(page, PAGINATION.DEFAULT_LIMIT);
  const { mutate: createFlight, isPending: isCreating } = useCreateFlight();
  const { mutate: uploadAndExtract, isPending: isUploading } = useUploadFlightFile();

  const handleCreateFlight = () => {
    setError('');
    if (!formData.airline || !formData.flightNumber || !formData.pnr || !formData.sector || !formData.passengerName || !formData.vendorCost || !formData.customerAmount) {
      setError('Please fill in all required fields');
      return;
    }

    const payload: any = {
      airline: formData.airline,
      flightNumber: formData.flightNumber,
      pnr: formData.pnr,
      sector: formData.sector,
      passengerName: formData.passengerName,
      vendorCost: parseFloat(formData.vendorCost) || 0,
      customerAmount: parseFloat(formData.customerAmount) || 0,
    };

    if (formData.clientId && formData.clientId.trim()) payload.clientId = formData.clientId.trim();
    if (formData.departureDate && formData.departureDate.toString().trim()) payload.departureDate = formData.departureDate;
    if (formData.returnDate && formData.returnDate.toString().trim()) payload.returnDate = formData.returnDate;

    createFlight(payload,
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setUploadMode(false);
          setFormData({
            airline: '',
            flightNumber: '',
            pnr: '',
            sector: '',
            passengerName: '',
            departureDate: '',
            returnDate: '',
            vendorCost: '',
            customerAmount: '',
            clientId: '',
          });
          setError('');
          refetch();
        },
        onError: (error: any) => {
          setError(error.response?.data?.error?.message || 'Failed to create flight');
        },
      }
    );
  };

  const handleFileUpload = (file: File) => {
    return new Promise(async (resolve, reject) => {
      try {
        setUploadStatus('extracting');
        setUploadError('');
        
        // Call upload; pass clientId only when present. Hooks/apiClient handle both cases.
        const payload = formData.clientId ? { file, clientId: formData.clientId } : file;

        uploadAndExtract(payload, {
          onSuccess: (response: any) => {
            const extractedData = response.data?.extractedData || response.data;
            
            // Populate form with extracted data
            setFormData(prev => ({
              ...prev,
              airline: extractedData.airline || prev.airline,
              flightNumber: extractedData.flightNumber || prev.flightNumber,
              pnr: extractedData.pnr || prev.pnr,
              sector: extractedData.sector || prev.sector,
              passengerName: extractedData.passengerName || prev.passengerName,
              departureDate: extractedData.departureDate || prev.departureDate,
              returnDate: extractedData.returnDate || prev.returnDate,
              vendorCost: extractedData.vendorCost?.toString() || prev.vendorCost,
              customerAmount: extractedData.customerAmount?.toString() || prev.customerAmount,
            }));
            
            setUploadStatus('success');
            setTimeout(() => {
              setUploadStatus('idle');
              resolve(response);
            }, 1500);
          },
          onError: (error: any) => {
            setUploadStatus('error');
            // Extract error message from various response formats
            let errorMsg = 'Failed to extract flight data';
            
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
        });
      } catch (err) {
        setUploadStatus('error');
        setUploadError('Upload failed');
        reject(err);
      }
    });
  };

  const columns = [
    {
      key: 'airline',
      label: 'Airline',
    },
    {
      key: 'flightNumber',
      label: 'Flight Number',
    },
    {
      key: 'pnr',
      label: 'PNR',
    },
    {
      key: 'passengerName',
      label: 'Passenger',
    },
    {
      key: 'sector',
      label: 'Route',
    },
    {
      key: 'customerAmount',
      label: 'Amount',
      render: (value: number) => formatCurrency(value),
      align: 'left' as const,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flight Management</h1>
          <p className="text-gray-600 mt-1">Manage flight bookings and reservations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCw size={20} /> Refresh
          </Button>
          {canCreate && (
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(true);
                setUploadMode(false);
                setFormData({
                  airline: '',
                  flightNumber: '',
                  pnr: '',
                  sector: '',
                  passengerName: '',
                  departureDate: '',
                  returnDate: '',
                  vendorCost: '',
                  customerAmount: '',
                  clientId: '',
                });
                setError('');
              }}
              className="flex items-center gap-2"
            >
              <Plus size={20} /> New Flight
            </Button>
          )}
        </div>
      </div>

      <Card>
        {data?.data?.data?.length ? (
          <>
            <Table
              columns={columns}
              data={data.data.data}
              isLoading={isPending}
              className="min-w-[700px]"
            />
            {data?.data?.pagination && (
              <Pagination
                page={page}
                totalPages={data.data.pagination.totalPages}
                onPageChange={setPage}
                isLoading={isPending}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No flights found. Create one to get started.</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        title={uploadMode ? "Upload Flight Ticket" : "Create New Flight Booking"}
        onClose={() => {
          setIsModalOpen(false);
          setUploadMode(false);
          setError('');
          setUploadError('');
        }}
        size="lg"
        footer={
          <>
            {uploadMode && (
              <Button variant="secondary" onClick={() => setUploadMode(false)}>
                Back
              </Button>
            )}
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsModalOpen(false);
                setUploadMode(false);
                setError('');
                setUploadError('');
              }}
            >
              Cancel
            </Button>
            {!uploadMode && (
              <Button
                variant="primary"
                onClick={handleCreateFlight}
                isLoading={isCreating}
              >
                Create
              </Button>
            )}
          </>
        }
      >
        {uploadMode ? (
          <div className="space-y-4">
            {uploadError && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
                <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Upload Error</p>
                  <p className="text-xs text-red-700">{uploadError}</p>
                </div>
              </div>
            )}
            <FileUpload
              onUpload={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              label="Upload Flight Ticket (PDF, DOC, JPG, PNG)"
              isLoading={isUploading || uploadStatus === 'extracting'}
              disabled={isUploading || uploadStatus === 'extracting'}
            />
            {uploadStatus === 'success' && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                <p className="text-sm text-green-800">Ticket processed! Form populated with extracted data.</p>
              </div>
            )}
          </div>
        ) : (
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
            
            <Button
              variant="secondary"
              onClick={() => setUploadMode(true)}
              className="w-full mb-3"
            >
              🎫 Or Upload Ticket
            </Button>

            <Select
              label="Client"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: (e.target.value || '').toString().trim() })}
              options={(clientsData?.data?.data || []).map((client: any) => ({ value: client._id || client.id, label: client.name }))}
              disabled={isLoadingClients}
            />

            <Input
              label="Airline *"
              value={formData.airline}
              onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
              placeholder="Emirates"
            />
            <Input
              label="Flight Number *"
              value={formData.flightNumber}
              onChange={(e) =>
                setFormData({ ...formData, flightNumber: e.target.value })
              }
              placeholder="EK201"
            />
            <Input
              label="PNR *"
              value={formData.pnr}
              onChange={(e) => setFormData({ ...formData, pnr: e.target.value })}
              placeholder="ABC123"
            />
            <Input
              label="Sector *"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              placeholder="NYC-DXB"
            />
            <Input
              label="Passenger Name *"
              value={formData.passengerName}
              onChange={(e) =>
                setFormData({ ...formData, passengerName: e.target.value })
              }
              placeholder="John Doe"
            />
            <Input
              label="Vendor Cost *"
              type="number"
              value={formData.vendorCost}
              onChange={(e) =>
                setFormData({ ...formData, vendorCost: e.target.value })
              }
              placeholder="500"
            />
            <Input
              label="Customer Amount *"
              type="number"
              value={formData.customerAmount}
              onChange={(e) =>
                setFormData({ ...formData, customerAmount: e.target.value })
              }
              placeholder="750"
            />
          </div>
        )}
      </Modal>
    </div>
    </div>
  );
}

export default function FlightPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FlightListContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
