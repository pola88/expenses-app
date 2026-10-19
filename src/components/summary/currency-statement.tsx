'use client';

import Decimal from 'decimal.js';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { AmountLine } from './ammount-line';
import type { WalletSummary } from '@/services/wallet.service';
import { apiFetch } from '@/lib/fetch';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

type Currency = 'USD' | 'ARS';

type CurrencyStatementProps = {
  currency: Currency;
  householdId: string;
};

export const CurrencyStatement = ({ currency, householdId }: CurrencyStatementProps) => {
  const searchParams = useSearchParams();
  const month = searchParams.get('month') ?? undefined;

  const { data, isLoading } = useQuery<WalletSummary>({
    queryKey: ['wallet-month', householdId, month],
    queryFn: () => {
      const url = month ? `/api/wallet?month=${month}` : '/api/wallet';
      return apiFetch<WalletSummary>(url);
    },
  });

  const t = useTranslations('dashboard.monthSummary');
  if (isLoading || !data) {
    return <Skeleton className="h-24 rounded-xl" />;
  }

  const { incomes, expenses, exchanges, net } = data.month;

  return (
    <div className="mt-2 flex flex-col gap-1">
      <div className="flex flex-row gap-1 lg:flex-col">
        <AmountLine label={t('incomeRow')} amount={new Decimal(incomes[currency])} />
        <AmountLine label={t('expenseRow')} amount={new Decimal(expenses[currency]).neg()} />
        <AmountLine label={t('exchangeRow')} amount={new Decimal(exchanges[currency])} />
      </div>
      <AmountLine
        className="mt-1 border-t pt-2"
        label={t('result')}
        amount={new Decimal(net[currency])}
        strong
        forceFullLine
      />
    </div>
  );
};
