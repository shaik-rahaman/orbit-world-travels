'use client';

import React, { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/shared';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useProfitReport, useModuleWiseReport, useSalesReport, useDashboardStats } from '@/hooks/useApi';
import { useClients } from '@/hooks/useApi';
import { formatCurrency } from '@/utils/helpers';

function ReportsContent() {
  const financialYear = new Date().getFullYear();

  // Fetch real data from API
  const { data: dashboardStatsData, isPending: isLoadingStats } = useDashboardStats(financialYear);
  const { data: profitReportData, isPending: isLoadingProfit } = useProfitReport(financialYear);
  const { data: moduleWiseData, isPending: isLoadingModules } = useModuleWiseReport(financialYear);
  const { data: salesReportData, isPending: isLoadingSales } = useSalesReport(financialYear);
  const { data: clientsData } = useClients(1, 1000);

  // Calculate metrics
  const metrics = useMemo(() => {
    const stats = dashboardStatsData?.data?.data || {};
    const clients = clientsData?.data?.data || [];

    const totalRevenue = Number(stats.totalRevenue) || 0;
    const totalProfit = Number(stats.totalProfit) || 0;
    const totalInvoices = Number(stats.finalizedInvoices) || 1;
    const totalClients = clients.length || 0;

    // Prevent division by zero
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';
    const avgOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    return {
      totalRevenue: Math.max(0, totalRevenue),
      totalProfit: Math.max(0, totalProfit),
      profitMargin: parseFloat(profitMargin),
      totalClients,
      avgOrderValue: Math.max(0, avgOrderValue),
    };
  }, [dashboardStatsData, clientsData]);

  // Process module-wise data for pie chart
  const moduleData = useMemo(() => {
    const modules = moduleWiseData?.data?.data || [];
    
    // Calculate total count
    const totalCount = Array.isArray(modules) 
      ? modules.reduce((sum: number, m: any) => sum + (m.count || m._count || 0), 0) 
      : 0;
    
    // Convert to percentages
    return Array.isArray(modules) 
      ? modules.map((m: any) => ({
          name: (m.module || m._id || 'Unknown').charAt(0).toUpperCase() + (m.module || m._id || 'Unknown').slice(1),
          value: totalCount > 0 ? Math.round(((m.count || m._count || 0) / totalCount) * 100) : 0,
          count: m.count || m._count || 0,
        }))
      : [];
  }, [moduleWiseData]);

  // Process sales data for charts
  const chartData = useMemo(() => {
    // Extract arrays from nested response structure
    const sales = salesReportData?.data?.data?.data || salesReportData?.data?.data || [];
    const profitData = profitReportData?.data?.data?.data || profitReportData?.data?.data || [];
    
    // Group by month
    const monthlyData: any = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (Array.isArray(sales)) {
      sales.forEach((invoice: any) => {
        const date = new Date(invoice.createdAt);
        const month = monthNames[date.getMonth()];
        
        if (!monthlyData[month]) {
          monthlyData[month] = { month, sales: 0, profit: 0 };
        }
        monthlyData[month].sales += Number(invoice.totalCustomerAmount) || 0;
      });
    }

    if (Array.isArray(profitData)) {
      profitData.forEach((invoice: any) => {
        const date = new Date(invoice.createdAt);
        const month = monthNames[date.getMonth()];
        
        if (monthlyData[month]) {
          monthlyData[month].profit += Number(invoice.totalMargin) || 0;
        }
      });
    }

    return Object.values(monthlyData).slice(-6); // Last 6 months
  }, [salesReportData, profitReportData]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const isLoading = isLoadingStats || isLoadingProfit || isLoadingModules || isLoadingSales;

  // Custom tooltip formatter for currency charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Track business metrics and performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(metrics.totalRevenue)} 
            icon={<DollarSign />} 
            trend="up" 
          />
          <StatCard 
            title="Profit Margin" 
            value={`${metrics.profitMargin}%`} 
            icon={<TrendingUp />} 
            trend="up" 
          />
          <StatCard 
            title="Total Clients" 
            value={metrics.totalClients.toString()} 
            icon={<Users />} 
          />
          <StatCard 
            title="Avg Order Value" 
            value={formatCurrency(metrics.avgOrderValue)} 
            icon={<BarChart3 />} 
            trend="up" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Monthly Sales & Profit">
            {isLoading ? (
              <div className="h-80 flex items-center justify-center text-gray-500">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="sales" fill="#3B82F6" name="Sales" />
                  <Bar dataKey="profit" fill="#10B981" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title="Module Distribution">
            {isLoading ? (
              <div className="h-80 flex items-center justify-center text-gray-500">Loading...</div>
            ) : moduleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={moduleData} 
                    cx="50%" 
                    cy="50%" 
                    labelLine={false} 
                    label={({ name, value }) => `${name}: ${value}%`} 
                    outerRadius={80} 
                    fill="#8884d8" 
                    dataKey="value"
                  >
                    {moduleData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">No data available</div>
            )}
          </Card>
        </div>

        <Card title="Sales Trend">
          {isLoading ? (
            <div className="h-80 flex items-center justify-center text-gray-500">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} name="Sales" />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return <DashboardLayout><ReportsContent /></DashboardLayout>;
}
