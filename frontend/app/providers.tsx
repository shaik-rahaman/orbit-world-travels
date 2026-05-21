'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
    setIsHydrated(true);
  }, [hydrate]);

  // Suppress hydration warnings until client-side state is ready
  if (typeof window !== 'undefined' && !isHydrated) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
