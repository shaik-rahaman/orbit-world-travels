'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  isLoading?: boolean;
  onRowClick?: (row: any) => void;
  className?: string;
}

function SkeletonRow({ columns }: { columns: TableColumn[] }) {
  return (
    <tr className="border-b border-gray-200">
      {columns.map((column) => (
        <td key={column.key} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
      ))}
    </tr>
  );
}

export function Table({ columns, data, isLoading, onRowClick, className = '' }: TableProps) {
  if (isLoading) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              {columns.map((column) => {
                const alignClass = column.align ? (column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left') : 'text-left';
                return (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className={`px-4 py-3 text-sm font-semibold text-gray-700 sticky top-0 bg-gray-100 z-10 ${alignClass}`}
                  >
                    {column.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-16 px-6 bg-gray-50 rounded-lg flex flex-col items-center justify-center">
        <svg className="w-12 h-12 text-gray-300 mb-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
        </svg>
        <p className="text-gray-500 font-medium">No data available</p>
        <p className="text-gray-400 text-sm">Try adjusting your filters or creating a new record</p>
      </div>
    );
  }

  return (
    <div className={`overflow-auto shadow-sm rounded-lg border border-gray-200 ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200">
            {columns.map((column) => {
              const alignClass = column.align ? (column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left') : 'text-left';
              return (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={`px-4 py-3 text-sm font-semibold text-gray-800 sticky top-0 bg-gradient-to-r from-gray-50 to-white z-10 ${alignClass}`}
                >
                  {column.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150 ${
                onRowClick ? 'cursor-pointer' : ''
              } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
            >
              {columns.map((column) => {
                const raw = row[column.key];
                const isNumber = typeof raw === 'number' || (column.label && /amount|price|cost|total/i.test(column.label));
                const alignClass = column.align ? (column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left') : (isNumber ? 'text-right' : 'text-left');
                return (
                  <td key={column.key} className={`px-4 py-3 text-sm text-gray-700 ${alignClass}`}>
                    {column.render ? column.render(raw, row) : (raw !== undefined && raw !== null && raw !== '' ? String(raw) : '-')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({ page, totalPages, onPageChange, isLoading = false }: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-6 px-6 py-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg shadow-sm">
      <div className="text-sm text-gray-600">
        Page <span className="font-semibold text-gray-900">{page}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalPages}</span>
      </div>
      <div className="flex gap-2">
        <button
          disabled={page === 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
          className="p-2 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-gray-200 transition-all"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <button
          disabled={page === totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
          className="p-2 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-gray-200 transition-all"
          aria-label="Next page"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}
