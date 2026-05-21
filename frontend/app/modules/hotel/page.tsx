'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Table, Pagination, Modal, Input, FileUpload, Select } from '@/components/shared';
import { useHotels, useCreateHotel, useUploadHotelFile, useClients } from '@/hooks/useApi';
import { PAGINATION, ROOM_TYPES } from '@/constants';
import { formatCurrency } from '@/utils/helpers';
import { Plus, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

function HotelListContent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'extracting' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    hotelName: '',
    city: '',
    roomType: '',
    guestName: '',
    checkInDate: '',
    checkOutDate: '',
    vendorCost: '',
    customerAmount: '',
    clientId: '',
  });
  const { data: clientsData, isPending: isLoadingClients } = useClients(1, 1000);
  const [uploadValidationErrors, setUploadValidationErrors] = useState<string[]>([]);
  const { data, isPending, refetch } = useHotels(page, PAGINATION.DEFAULT_LIMIT);
  const { mutate: createHotel, isPending: isCreating } = useCreateHotel();
  const { mutate: uploadAndExtract, isPending: isUploading } = useUploadHotelFile();

  const handleCreateHotel = () => {
    setError('');
    if (!formData.hotelName || !formData.city || !formData.checkInDate || !formData.checkOutDate || !formData.roomType || !formData.guestName || !formData.vendorCost || !formData.customerAmount) {
      setError('Please fill in all required fields');
      return;
    }

    createHotel(
      {
        ...formData,
        vendorCost: parseFloat(formData.vendorCost) || 0,
        customerAmount: parseFloat(formData.customerAmount) || 0,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setUploadMode(false);
          setFormData({
            hotelName: '',
            city: '',
            roomType: '',
            guestName: '',
            checkInDate: '',
            checkOutDate: '',
            vendorCost: '',
            customerAmount: '',
            clientId: '',
          });
          setError('');
          refetch();
        },
        onError: (error: any) => {
          setError(error.response?.data?.error?.message || 'Failed to create hotel booking');
        },
      }
    );
  };

  const handleFileUpload = (file: File) => {
    return new Promise(async (resolve, reject) => {
      try {
        setUploadStatus('extracting');
        setUploadError('');
        setUploadValidationErrors([]);
        const payload = formData.clientId ? { file, clientId: formData.clientId } : file;

        uploadAndExtract(payload, {
          onSuccess: (response: any) => {
            const extractedData = response.data?.extractedData || response.data;
            const validationErrors = response.data?.validationErrors || response.data?.data?.validationErrors || [];
            
            setFormData(prev => ({
              ...prev,
              hotelName: extractedData.hotelName || prev.hotelName,
              city: extractedData.city || prev.city,
              roomType: extractedData.roomType || prev.roomType,
              guestName: extractedData.guestName || prev.guestName,
              checkInDate: extractedData.checkInDate || prev.checkInDate,
              checkOutDate: extractedData.checkOutDate || prev.checkOutDate,
              vendorCost: extractedData.vendorCost?.toString() || prev.vendorCost,
              customerAmount: extractedData.customerAmount?.toString() || prev.customerAmount,
            }));
            
            setUploadStatus('success');
            if (validationErrors && validationErrors.length) setUploadValidationErrors(validationErrors);
            setTimeout(() => {
              setUploadStatus('idle');
              resolve(response);
            }, 1500);
          },
          onError: (error: any) => {
            setUploadStatus('error');
            // Extract error message from various response formats
            let errorMsg = 'Failed to extract hotel data';
            
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
    { key: 'hotelName', label: 'Hotel Name' },
    { key: 'city', label: 'City' },
    { key: 'roomType', label: 'Room Type' },
    { key: 'guestName', label: 'Guest' },
    { key: 'customerAmount', label: 'Amount', render: (v: number) => formatCurrency(v), align: 'left' as const },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hotel Management</h1>
          <p className="text-gray-600 mt-1">Manage hotel bookings and reservations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCw size={20} /> Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setIsModalOpen(true);
              setUploadMode(false);
              setFormData({
                hotelName: '',
                city: '',
                roomType: '',
                guestName: '',
                checkInDate: '',
                checkOutDate: '',
                vendorCost: '',
                customerAmount: '',
                clientId: '',
              });
              setError('');
            }}
            className="flex items-center gap-2"
          >
            <Plus size={20} /> New Hotel
          </Button>
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
            <p className="text-gray-500">No hotels found. Create one to get started.</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        title={uploadMode ? "Upload Hotel Booking" : "Create New Hotel Booking"}
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
                onClick={handleCreateHotel}
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
              label="Upload Hotel Booking (PDF, DOC, JPG, PNG)"
              isLoading={isUploading || uploadStatus === 'extracting'}
              disabled={isUploading || uploadStatus === 'extracting'}
            />
            {uploadValidationErrors.length > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 mt-2">
                <p className="text-sm font-medium text-yellow-800">Extraction Warnings</p>
                <ul className="text-xs text-yellow-700 list-disc pl-5 mt-1">
                  {uploadValidationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            {uploadStatus === 'success' && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                <p className="text-sm text-green-800">Booking processed! Form populated with extracted data.</p>
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
              🏨 Or Upload Booking
            </Button>

            <Input label="Hotel Name *" value={formData.hotelName} onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })} placeholder="Hilton Hotel" />
            <Input label="City *" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="New York" />
            <Input label="Room Type *" value={formData.roomType} onChange={(e) => setFormData({ ...formData, roomType: e.target.value })} placeholder="Deluxe Suite" />
            <Input label="Guest Name *" value={formData.guestName} onChange={(e) => setFormData({ ...formData, guestName: e.target.value })} placeholder="John Doe" />
            <Input label="Check-In Date *" type="date" value={formData.checkInDate} onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })} />
            <Input label="Check-Out Date *" type="date" value={formData.checkOutDate} onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })} />
            <Input label="Vendor Cost *" type="number" value={formData.vendorCost} onChange={(e) => setFormData({ ...formData, vendorCost: e.target.value })} placeholder="200" />
            <Input label="Customer Amount *" type="number" value={formData.customerAmount} onChange={(e) => setFormData({ ...formData, customerAmount: e.target.value })} placeholder="300" />
          </div>
        )}
      </Modal>
    </div>
    </div>
  );
}

export default function HotelPage() {
  return <DashboardLayout><HotelListContent /></DashboardLayout>;
}
