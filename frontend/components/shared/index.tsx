'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Table, Pagination } from './Table';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center';
  const variantStyles = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed',
    secondary: 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-900 hover:from-indigo-200 hover:to-purple-200 hover:shadow-sm active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 hover:shadow-md active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed',
  };
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${props.className}`}
    >
      {isLoading ? <span className="animate-spin">⏳</span> : children}
    </button>
  );
}

interface BadgeProps {
  status: string;
  children: React.ReactNode;
}

export function Badge({ status, children }: BadgeProps) {
  const statusStyles: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    'APPROVED': 'bg-green-100 text-green-800 border border-green-300',
    'REJECTED': 'bg-red-100 text-red-800 border border-red-300',
    'DRAFT': 'bg-gray-100 text-gray-800 border border-gray-300',
    'SENT': 'bg-blue-100 text-blue-800 border border-blue-300',
    'PAID': 'bg-green-100 text-green-800 border border-green-300',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800 border border-gray-300'}`}>
      {children}
    </span>
  );
}

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, title, onClose, children, footer, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`relative bg-white rounded-lg shadow-2xl border border-indigo-200 ${sizeStyles[size]} max-h-90vh overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent">{title}</h2>
          <button
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-indigo-200 flex justify-end gap-3 bg-gradient-to-r from-indigo-50 to-purple-50">{footer}</div>}
      </div>
    </div>
  );
}

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export function Card({ title, children, className = '', footer }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-indigo-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50">{footer}</div>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-1 text-gray-900 placeholder-gray-500 transition-colors ${
          error ? 'border-red-500 bg-red-50' : 'border-indigo-300 bg-white hover:border-indigo-400'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, options, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-1 text-gray-900 bg-white transition-colors ${
          error ? 'border-red-500 bg-red-50' : 'border-indigo-300 hover:border-indigo-400'
        } ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="">Select an option</option>
        {options.map((opt, i) => (
          <option key={`${opt.value}-${i}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  backgroundColor?: string;
}

export function StatCard({ title, value, icon, trend, backgroundColor = 'bg-gradient-to-br from-indigo-50 to-purple-50' }: StatCardProps) {
  return (
    <Card className={`${backgroundColor} p-6 hover:shadow-xl border-indigo-200 transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-indigo-700 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent mt-2">{value}</p>
          {trend && (
            <p className={`text-xs font-semibold mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↑' : '↓'} Trend
            </p>
          )}
        </div>
        <div className="text-blue-600 text-4xl opacity-80">{icon}</div>
      </div>
    </Card>
  );
}

export { Table, Pagination };
export { FileUpload } from './FileUpload';
export { Toast, ToastContainer } from './Toast';
export { DemoBanner } from './DemoBanner';
