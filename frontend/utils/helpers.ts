export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function calculateMargin(vendorCost: number, customerAmount: number): number {
  return customerAmount - vendorCost;
}

export function calculateMarginPercentage(vendorCost: number, customerAmount: number): number {
  if (vendorCost === 0) return 0;
  return ((customerAmount - vendorCost) / vendorCost) * 100;
}

export function getStatusColor(status: string): string {
  const statusColorMap: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'APPROVED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800',
    'DRAFT': 'bg-gray-100 text-gray-800',
    'SENT': 'bg-blue-100 text-blue-800',
    'PAID': 'bg-green-100 text-green-800',
  };
  return statusColorMap[status] || 'bg-gray-100 text-gray-800';
}

export function truncateText(text: string, length: number = 50): string {
  return text.length > length ? `${text.substring(0, length)}...` : text;
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
