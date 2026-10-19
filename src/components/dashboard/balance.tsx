'use client';

import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import type { WalletSummary } from '@/services/wallet.service';
import { apiFetch } from '@/lib/fetch';
import { CurrencyStatement } from '../summary/currency-statement';
import { MoneyValue } from '../money-value';

type Currency = 'USD' | 'ARS';
type Props = { currency: Currency; householdId: string; initialData: WalletSummary };

export function BalanceCard({ currency, householdId, initialData }: Props) {
  const { data, isLoading } = useQuery<WalletSummary>({
    queryKey: ['wallet', householdId],
    queryFn: () => apiFetch<WalletSummary>('/api/wallet'),
    initialData,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 divide-y divide-dotted p-6">
      <div className="flex items-start pb-2">
        <p className="mt-1.5 flex-1 text-3xl font-bold tabular-nums lg:text-4xl">
          <MoneyValue value={data.balance[currency]} />
        </p>
        <span className="rounded border px-1.5 py-0.5 font-mono text-xs font-medium tracking-wide">
          {currency}
        </span>
      </div>
      <CurrencyStatement currency={currency} householdId={householdId} />
    </div>
  );
}
