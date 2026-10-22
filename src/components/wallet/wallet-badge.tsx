'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/fetch';
import { formatAmount } from '@/lib/money';

type WalletBalance = { ARS: string; USD: string };
type WalletSummary = {
  balance: WalletBalance;
  month: { incomes: WalletBalance; expenses: WalletBalance };
};

export function WalletBadge({ householdId }: { householdId: string }) {
  const t = useTranslations('wallet');
  const { data, isLoading } = useQuery<WalletSummary>({
    queryKey: ['wallet', householdId],
    queryFn: () => apiFetch<WalletSummary>('/api/wallet'),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 px-1">
        <Skeleton className="h-7 w-full rounded-md" />
        <Skeleton className="h-7 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 px-1">
      <p className="mb-1 text-[10px] tracking-widest text-muted-foreground uppercase">
        {t('title')}
      </p>
      <div className="flex items-center justify-between rounded-md border border-border bg-background px-2 py-1.5">
        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
          USD$
        </span>
        <span className="text-sm font-medium">{data ? formatAmount(data.balance.USD) : '—'}</span>
      </div>
      <div className="flex items-center justify-between rounded-md border border-border bg-background px-2 py-1.5">
        <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-800">
          ARS$
        </span>
        <span className="text-sm font-medium">{data ? formatAmount(data.balance.ARS) : '—'}</span>
      </div>
    </div>
  );
}
