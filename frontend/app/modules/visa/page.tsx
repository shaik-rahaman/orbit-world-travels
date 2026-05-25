'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, Button, Table, Pagination, Badge, Modal, Input, Select, FileUpload } from '@/components/shared';
import { useVisas, useCreateVisa, useUploadVisaFile, useClients } from '@/hooks/useApi';
import { usePermissions } from '@/hooks/usePermissions';
import { VISA_TYPES, VISA_STATUSES, PAGINATION } from '@/constants';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { Plus, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

function VisaListContent() {
  const queryClient = useQueryClient();
  const { canCreate } = usePermissions();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'extracting' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [uploadValidationErrors, setUploadValidationErrors] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    applicantName: '',
    country: '',
    passportNumber: '',
    visaType: '',
    vendorCost: '',
    customerAmount: '',
    notes: '',
    clientId: '',
  });
  const { data, isPending, refetch } = useVisas(page, PAGINATION.DEFAULT_LIMIT);
  const { data: clientsData, isPending: isLoadingClients } = useClients(1, 1000);
  const { mutate: createVisa, isPending: isCreating } = useCreateVisa();
  const { mutate: uploadAndExtract, isPending: isUploading } = useUploadVisaFile();

  const handleCreateVisa = () => {
    setError('');
    if (!formData.applicantName || !formData.country || !formData.passportNumber || !formData.visaType || !formData.clientId) {
      setError('Please fill in all required fields');
      return;
    }

    createVisa(
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
            applicantName: '',
            country: '',
            passportNumber: '',
            visaType: '',
            vendorCost: '',
            customerAmount: '',
            notes: '',
            clientId: '',
          });
          setError('');
          refetch();
        },
        onError: (error: any) => {
          setError(error.response?.data?.error?.message || 'Failed to create visa');
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
        // pass clientId only when present
        const payload = formData.clientId ? { file, clientId: formData.clientId } : file;

        uploadAndExtract(payload, {
          onSuccess: (response: any) => {
            const extractedData = response.data?.extractedData || response.data;
            const validationErrors = response.data?.validationErrors || response.data?.data?.validationErrors || [];
            
            // Populate form with extracted data
            setFormData(prev => ({
              ...prev,
              applicantName: extractedData.applicantName || prev.applicantName,
              country: extractedData.country || prev.country,
              passportNumber: extractedData.passportNumber || prev.passportNumber,
              visaType: extractedData.visaType || prev.visaType,
              vendorCost: extractedData.vendorCost?.toString() || prev.vendorCost,
              customerAmount: extractedData.customerAmount?.toString() || prev.customerAmount,
              notes: extractedData.notes || prev.notes,
            }));
            
            setUploadStatus('success');
            if (validationErrors && validationErrors.length) {
              setUploadValidationErrors(validationErrors);
            }
            setTimeout(() => {
              setUploadStatus('idle');
              resolve(response);
            }, 1500);
          },
          onError: (error: any) => {
            setUploadStatus('error');
            // Extract error message from various response formats
            let errorMsg = 'Failed to extract visa data';
            
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
      key: 'applicantName',
      label: 'Applicant Name',
    },
    {
      key: 'country',
      label: 'Country',
    },
    {
      key: 'visaType',
      label: 'Type',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <Badge status={value}>{value}</Badge>,
    },
    {
      key: 'customerAmount',
      label: 'Amount',
      render: (value: number) => formatCurrency(value),
      align: 'left' as const,
    },
    {
      key: 'margin',
      label: 'Margin',
      render: (value: number) => formatCurrency(value),
      align: 'left' as const,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visa Management</h1>
          <p className="text-gray-600 mt-1">Manage visa applications and track status</p>
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
                  applicantName: '',
                  country: '',
                  passportNumber: '',
                  visaType: '',
                  vendorCost: '',
                  customerAmount: '',
                  notes: '',
                  clientId: '',
                });
                setError('');
              }}
              className="flex items-center gap-2"
            >
              <Plus size={20} /> New Visa
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
            <p className="text-gray-500">No visas found. Create one to get started.</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        title={uploadMode ? "Upload Visa Document" : "Create New Visa Application"}
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
                onClick={handleCreateVisa}
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
              label="Upload Visa Document (PDF, DOC, JPG, PNG)"
              isLoading={isUploading || uploadStatus === 'extracting'}
              disabled={isUploading || uploadStatus === 'extracting'}
            />
            {uploadStatus === 'success' && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                <p className="text-sm text-green-800">Document processed! Form populated with extracted data.</p>
              </div>
            )}
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
              📄 Or Upload Document
            </Button>

            <Select
              label="Client *"
              value={formData.clientId}
              onChange={(e) =>
                setFormData({ ...formData, clientId: (e.target.value || '').toString().trim() })
              }
              options={(clientsData?.data?.data || []).map((client: any) => ({
                value: client._id || client.id,
                label: client.name,
              }))}
              disabled={isLoadingClients}
            />
            <Input
              label="Applicant Name *"
              value={formData.applicantName}
              onChange={(e) =>
                setFormData({ ...formData, applicantName: e.target.value })
              }
              placeholder="John Doe"
            />
            <Input
              label="Country *"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="India"
            />
            <Input
              label="Passport Number *"
              value={formData.passportNumber}
              onChange={(e) =>
                setFormData({ ...formData, passportNumber: e.target.value })
              }
              placeholder="A12345678"
            />
            <Select
              label="Visa Type *"
              value={formData.visaType}
              onChange={(e) =>
                setFormData({ ...formData, visaType: e.target.value })
              }
              options={VISA_TYPES.map((type) => ({ value: type, label: type }))}
            />
            <Input
              label="Vendor Cost"
              type="number"
              value={formData.vendorCost}
              onChange={(e) =>
                setFormData({ ...formData, vendorCost: e.target.value })
              }
              placeholder="100"
            />
            <Input
              label="Customer Amount"
              type="number"
              value={formData.customerAmount}
              onChange={(e) =>
                setFormData({ ...formData, customerAmount: e.target.value })
              }
              placeholder="150"
            />
            <Input
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
            />
          </div>
        )}
      </Modal>
    </div>
    </div>
  );
}

export default function VisaPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <VisaListContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
