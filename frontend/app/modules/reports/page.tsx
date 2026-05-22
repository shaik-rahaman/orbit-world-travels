'use client';

import React, { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/shared';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { BarChart3, TrendingUp, Users, DollarSign, AlertCircle } from 'lucide-react';
import { useProfitReport, useModuleWiseReport, useSalesReport, useDashboardStats } from '@/hooks/useApi';
import { useClients } from '@/hooks/useApi';
import { formatCurrency } from '@/utils/helpers';


function ReportsContent() {
  const financialYear = new Date().getFullYear();

  // Fetch real data from API
  const { data: dashboardStatsData, isPending: isLoadingStats, error: dashboardError } = useDashboardStats(financialYear);
  const { data: profitReportData, isPending: isLoadingProfit, error: profitError } = useProfitReport(financialYear);
  const { data: moduleWiseData, isPending: isLoadingModules, error: moduleError } = useModuleWiseReport(financialYear);
  const { data: salesReportData, isPending: isLoadingSales, error: salesError } = useSalesReport(financialYear);
  const { data: clientsData, error: clientsError } = useClients(1, 1000);

  // Use backend dashboard stats for KPIs - FIXED data access
  const metrics = useMemo(() => {
    try {
      const kpis = dashboardStatsData?.data?.data?.kpis || {};
      const totalRevenue = Number(kpis.totalRevenue) || 0;
      const totalProfit = Number(kpis.totalProfit) || 0;
      const profitMargin = Number(kpis.profitMargin) || 0;
      const avgOrderValue = Number(kpis.avgOrderValue) || 0;
      const totalTransactions = Number(kpis.totalTransactions) || 0;
      
      const totalClients = Array.isArray(clientsData?.data?.data) ? clientsData.data.data.length : 0;
      
      return {
        totalRevenue,
        totalProfit,
        profitMargin,
        totalClients,
        avgOrderValue,
        totalTransactions,
      };
    } catch (err) {
      console.error('[Reports] Error calculating metrics:', err);
      return {
        totalRevenue: 0,
        totalProfit: 0,
        profitMargin: 0,
        totalClients: 0,
        avgOrderValue: 0,
        totalTransactions: 0,
      };
    }
  }, [dashboardStatsData, clientsData]);

  // Process module-wise data for pie chart - FIXED
  const moduleData = useMemo(() => {
    try {
      // moduleWiseData contains the module distribution array
      const modules = moduleWiseData?.data?.data || [];
      
      if (!Array.isArray(modules) || modules.length === 0) {
        return [];
      }

      return modules
        .map((m: any) => ({
          name: (m.module || m._id || 'Unknown').toUpperCase(),
          value: Number(m.percentage || 0),
          count: Number(m.count || 0),
        }))
        .filter(m => m.count > 0);
    } catch (err) {
      console.error('[Reports] Error processing module data:', err);
      return [];
    }
  }, [moduleWiseData]);

  // Process monthly sales & profit data - FIXED
  const monthlyChartData = useMemo(() => {
    try {
      // Use trend data from profit report (has both revenue and profit by month)
      const trend = profitReportData?.data?.data?.trend || [];
      
      if (!Array.isArray(trend) || trend.length === 0) {
        return [];
      }

      return trend
        .map((item: any) => ({
          month: item.month || '',
          sales: Number(item.revenue || 0),
          profit: Number(item.profit || 0),
        }))
        .filter(item => item.month)
        .slice(-6); // Last 6 months
    } catch (err) {
      console.error('[Reports] Error processing chart data:', err);
      return [];
    }
  }, [profitReportData]);

  // Error handling
  if (dashboardError || profitError || moduleError || salesError || clientsError) {
    const errors = [
      dashboardError ? `Dashboard: ${dashboardError.message}` : null,
      profitError ? `Profit: ${profitError.message}` : null,
      moduleError ? `Modules: ${moduleError.message}` : null,
      salesError ? `Sales: ${salesError.message}` : null,
      clientsError ? `Clients: ${clientsError.message}` : null,
    ].filter(Boolean);

    return (
      <div className="p-6">
        <DashboardLayout>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-red-900 font-semibold mb-2">Error loading reports</h3>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          </div>
        </DashboardLayout>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const isLoading = isLoadingStats || isLoadingProfit || isLoadingModules || isLoadingSales;

  // Custom tooltip formatter for currency charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => {
            const value = Number(entry.value) || 0;
            return (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {formatCurrency(value)}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Validate chart data
  const hasMonthlyData = Array.isArray(monthlyChartData) && monthlyChartData.length > 0;
  const hasModuleData = Array.isArray(moduleData) && moduleData.length > 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Track business metrics and performance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(metrics.totalRevenue)} 
            icon={<DollarSign className="text-blue-600" />} 
            trend="up" 
          />
          <StatCard 
            title="Total Profit" 
            value={formatCurrency(metrics.totalProfit)} 
            icon={<TrendingUp className="text-green-600" />} 
            trend="up" 
          />
          <StatCard 
            title="Profit Margin" 
            value={`${metrics.profitMargin.toFixed(2)}%`} 
            icon={<BarChart3 className="text-orange-600" />} 
            trend={metrics.profitMargin >= 0 ? 'up' : 'down'} 
          />
          <StatCard 
            title="Avg Order Value" 
            value={formatCurrency(metrics.avgOrderValue)} 
            icon={<DollarSign className="text-purple-600" />} 
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Sales & Profit Chart */}
          <Card title="Monthly Sales & Profit">
            {isLoading ? (
              <div className="h-80 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-48"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ) : hasMonthlyData ? (
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width={Math.max(400, 500)} height={300}>
                  <BarChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="sales" fill="#3B82F6" name="Revenue" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="profit" fill="#10B981" name="Profit" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500 flex-col">
                <BarChart3 className="mb-2 opacity-50" size={32} />
                <p>No monthly data available</p>
              </div>
            )}
          </Card>

          {/* Module Distribution Chart */}
          <Card title="Module Distribution">
            {isLoading ? (
              <div className="h-80 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-48"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ) : hasModuleData ? (
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
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500 flex-col">
                <BarChart3 className="mb-2 opacity-50" size={32} />
                <p>No module data available</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sales Trend Chart */}
        <Card title="Sales Trend">
          {isLoading ? (
            <div className="h-80 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-48"></div>
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
            </div>
          ) : hasMonthlyData ? (
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width={Math.max(400, 600)} height={300}>
                <AreaChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="sales" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSales)" name="Revenue" />
                  <Area type="monotone" dataKey="profit" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500 flex-col">
              <TrendingUp className="mb-2 opacity-50" size={32} />
              <p>No trend data available</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return <DashboardLayout><ReportsContent /></DashboardLayout>;
}
