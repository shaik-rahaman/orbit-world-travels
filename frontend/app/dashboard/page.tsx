'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/shared';
import { useVisas, useFlights, useHotels, useInsurance, useInvoices, useClients } from '@/hooks/useApi';
import { formatCurrency } from '@/utils/helpers';
import { DollarSign, TrendingUp, Users, FileText } from 'lucide-react';

function DashboardContent() {
  const { data: visasData } = useVisas(1, 100);
  const { data: flightsData } = useFlights(1, 100);
  const { data: hotelsData } = useHotels(1, 100);
  const { data: insuranceData } = useInsurance(1, 100);
  const { data: invoicesData } = useInvoices(1, 100);
  const { data: clientsData } = useClients(1, 100);

  const calculateTotalSales = (items: any[]) =>
    items?.reduce((sum, item) => sum + (item.customerAmount || 0), 0) || 0;

  const calculateTotalProfit = (items: any[]) =>
    items?.reduce((sum, item) => sum + (item.margin || 0), 0) || 0;

  const totalSales =
    calculateTotalSales(visasData?.data?.data || []) +
    calculateTotalSales(flightsData?.data?.data || []) +
    calculateTotalSales(hotelsData?.data?.data || []) +
    calculateTotalSales(insuranceData?.data?.data || []);

  const totalProfit =
    calculateTotalProfit(visasData?.data?.data || []) +
    calculateTotalProfit(flightsData?.data?.data || []) +
    calculateTotalProfit(hotelsData?.data?.data || []) +
    calculateTotalProfit(insuranceData?.data?.data || []);

  const totalClients = clientsData?.data?.pagination?.total || 0;
  const pendingVisas =
    visasData?.data?.data?.filter((v: any) => v.status === 'PENDING').length || 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-indigo-700 font-semibold mt-2">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value={formatCurrency(totalSales)}
          icon={<DollarSign />}
          trend="up"
        />
        <StatCard
          title="Total Profit"
          value={formatCurrency(totalProfit)}
          icon={<TrendingUp />}
          trend="up"
        />
        <StatCard title="Total Clients" value={totalClients} icon={<Users />} />
        <StatCard
          title="Pending Tasks"
          value={pendingVisas}
          icon={<FileText />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card title="Recent Activity" className="lg:col-span-2">
          <div className="space-y-4">
            {[
              { action: 'New visa application', module: 'Visa', time: '2 hours ago' },
              { action: 'Flight booking confirmed', module: 'Flight', time: '4 hours ago' },
              { action: 'Hotel reservation created', module: 'Hotel', time: '1 day ago' },
              { action: 'Invoice #1001 finalized', module: 'Invoice', time: '2 days ago' },
              { action: 'New client registered', module: 'CRM', time: '3 days ago' },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.module}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card title="Module Summary">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Visas</span>
              <span className="font-semibold text-gray-900">
                {visasData?.data?.data?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Flights</span>
              <span className="font-semibold text-gray-900">
                {flightsData?.data?.data?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hotels</span>
              <span className="font-semibold text-gray-900">
                {hotelsData?.data?.data?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Insurance</span>
              <span className="font-semibold text-gray-900">
                {insuranceData?.data?.data?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Invoices</span>
              <span className="font-semibold text-gray-900">
                {invoicesData?.data?.data?.length || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
