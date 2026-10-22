'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState } from 'react';
import { QuickAddProvider } from './quick-add/quick-add-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <QuickAddProvider>{children}</QuickAddProvider>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
