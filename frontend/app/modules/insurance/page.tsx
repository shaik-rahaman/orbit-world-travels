'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, Button, Table, Pagination, Badge, Modal, Input, Select, FileUpload } from '@/components/shared';
import { useInsurance, useCreateInsurance, useUploadInsuranceFile, useClients } from '@/hooks/useApi';
import { usePermissions } from '@/hooks/usePermissions';
import { PAGINATION, INSURANCE_TYPES } from '@/constants';
import { formatCurrency } from '@/utils/helpers';
import { Plus, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

function InsuranceListContent() {
  const queryClient = useQueryClient();
  const { canCreate } = usePermissions();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'extracting' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    policyNumber: '',
    insuredName: '',
    policyType: '',
    coverageAmount: '',
    vendorCost: '',
    customerAmount: '',
    startDate: '',
    endDate: '',
    clientId: '',
  });
  const { data: clientsData, isPending: isLoadingClients } = useClients(1, 1000);
  const [uploadValidationErrors, setUploadValidationErrors] = useState<string[]>([]);
  const { data, isPending, refetch } = useInsurance(page, PAGINATION.DEFAULT_LIMIT);
  const { mutate: createInsurance, isPending: isCreating } = useCreateInsurance();
  const { mutate: uploadAndExtract, isPending: isUploading } = useUploadInsuranceFile();

  const handleCreateInsurance = () => {
    setError('');
    if (!formData.policyNumber || !formData.insuredName || !formData.policyType || !formData.coverageAmount || !formData.vendorCost || !formData.customerAmount || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    createInsurance(
      {
        ...formData,
        coverageAmount: parseFloat(formData.coverageAmount) || 0,
        vendorCost: parseFloat(formData.vendorCost) || 0,
        customerAmount: parseFloat(formData.customerAmount) || 0,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setUploadMode(false);
          setFormData({
            policyNumber: '',
            insuredName: '',
            policyType: '',
            coverageAmount: '',
            vendorCost: '',
            customerAmount: '',
            startDate: '',
            endDate: '',
            clientId: '',
          });
          setError('');
          refetch();
        },
        onError: (error: any) => {
          setError(error.response?.data?.error?.message || 'Failed to create insurance policy');
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
              policyNumber: extractedData.policyNumber || prev.policyNumber,
              insuredName: extractedData.insuredName || prev.insuredName,
              policyType: extractedData.policyType || prev.policyType,
              coverageAmount: extractedData.coverageAmount?.toString() || prev.coverageAmount,
              vendorCost: extractedData.vendorCost?.toString() || prev.vendorCost,
              customerAmount: extractedData.customerAmount?.toString() || prev.customerAmount,
              startDate: extractedData.startDate || prev.startDate,
              endDate: extractedData.endDate || prev.endDate,
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
            let errorMsg = 'Failed to extract insurance data';
            
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
    { key: 'policyNumber', label: 'Policy Number' },
    { key: 'insuredName', label: 'Insured Name' },
    { key: 'policyType', label: 'Type' },
    { key: 'coverageAmount', label: 'Coverage', render: (v: number) => formatCurrency(v), align: 'left' as const },
    { key: 'customerAmount', label: 'Amount', render: (v: number) => formatCurrency(v), align: 'left' as const },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Insurance Management</h1>
          <p className="text-gray-600 mt-1">Manage insurance policies and coverage</p>
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
                    policyNumber: '',
                    insuredName: '',
                    policyType: '',
                    coverageAmount: '',
                    vendorCost: '',
                    customerAmount: '',
                    startDate: '',
                    endDate: '',
                    clientId: '',
                  });
                setError('');
              }}
              className="flex items-center gap-2"
            >
              <Plus size={20} /> New Policy
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
            <p className="text-gray-500">No insurance policies found. Create one to get started.</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        title={uploadMode ? "Upload Insurance Document" : "Create New Insurance Policy"}
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
                onClick={handleCreateInsurance}
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
              label="Upload Insurance Document (PDF, DOC, JPG, PNG)"
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
                <p className="text-sm text-green-800">Document processed! Form populated with extracted data.</p>
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
              📋 Or Upload Document
            </Button>

            <Input label="Policy Number *" value={formData.policyNumber} onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })} placeholder="POL-12345" />
            <Input label="Insured Name *" value={formData.insuredName} onChange={(e) => setFormData({ ...formData, insuredName: e.target.value })} placeholder="John Doe" />
            <Select label="Policy Type *" value={formData.policyType} onChange={(e) => setFormData({ ...formData, policyType: e.target.value })} options={INSURANCE_TYPES.map(t => ({ value: t, label: t }))} />
            <Input label="Coverage Amount *" type="number" value={formData.coverageAmount} onChange={(e) => setFormData({ ...formData, coverageAmount: e.target.value })} placeholder="100000" />
            <Input label="Vendor Cost *" type="number" value={formData.vendorCost} onChange={(e) => setFormData({ ...formData, vendorCost: e.target.value })} placeholder="500" />
            <Input label="Customer Amount *" type="number" value={formData.customerAmount} onChange={(e) => setFormData({ ...formData, customerAmount: e.target.value })} placeholder="750" />
            <Input label="Start Date *" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
            <Input label="End Date *" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
          </div>
        )}
      </Modal>
    </div>
    </div>
  );
}

export default function InsurancePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <InsuranceListContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
