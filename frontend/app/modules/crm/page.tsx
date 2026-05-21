'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Table, Pagination, Modal, Input } from '@/components/shared';
import { useClients, useCreateClient } from '@/hooks/useApi';
import { PAGINATION } from '@/constants';
import { Plus, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

function CRMListContent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
  });
  const { data, isPending } = useClients(page, PAGINATION.DEFAULT_LIMIT);
  const { mutate: createClient, isPending: isCreating } = useCreateClient();

  const handleCreateClient = () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    createClient(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ name: '', email: '', phone: '', country: '' });
      },
    });
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'country', label: 'Country' },
    {
      key: '_count',
      label: 'Bookings',
      render: (v: any) => v ? `V:${v.visas} F:${v.flights} H:${v.hotels}` : '-',
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM - Clients</h1>
          <p className="text-gray-600 mt-1">Manage client relationships and information</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={20} /> New Client
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={data?.data?.data || []} isLoading={isPending} />
        {data?.data?.pagination && (
          <Pagination page={page} totalPages={data.data.pagination.totalPages} onPageChange={setPage} isLoading={isPending} />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        title="Create New Client"
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateClient} isLoading={isCreating}>Create</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Input label="Email *" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <Input label="Country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
        </div>
      </Modal>
    </div>
    </div>
  );
}

export default function CRMPage() {
  return <DashboardLayout><CRMListContent /></DashboardLayout>;
}
