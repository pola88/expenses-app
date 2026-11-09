'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { MovementList } from '@/components/dashboard/movement-list';
import { Skeleton } from '@/components/ui/skeleton';
import { MonthNavigator } from '@/components/ui/month-navigator';
import { Pagination } from '@/components/ui/pagination';

import { parseMonthParam, monthBounds } from '@/lib/month';
import { PAGE_SIZE } from '@/lib/constants';

import { MyToggle } from '@/components/toggle';
import { useGetExchanges, useGetExpenses, useGetIncomes } from '@/actions/api-calls';
import { useTransactions } from '@/lib/hooks/useTransactions';
import type { FilterType, FilterCurrency } from '@/types/transaction-page';
import { Totals } from '@/components/transactions/totals';
import { ExpenseTemplateList } from '@/components/transactions/expense-template';

export default function TransactionsPage() {
  const t = useTranslations('movements');
  const [type, setType] = useState<FilterType>('all');
  const [currency, setCurrency] = useState<FilterCurrency>('all');
  const [page, setPage] = useState(0);

  const searchParams = useSearchParams();
  const selectedMonth = parseMonthParam(searchParams.get('month'));
  const { from: fromDate, to: toDate } = monthBounds(selectedMonth);
  const from = fromDate.toISOString();
  const to = toDate.toISOString();

  const { expenses, isLoading: loadingE } = useGetExpenses(from, to);
  const { incomes, isLoading: loadingI } = useGetIncomes(from, to);
  const { exchanges, isLoading: loadingX } = useGetExchanges(from, to);

  const isLoading = loadingE || loadingI || loadingX;
  const { movements, currencyFilters, typeFilters } = useTransactions({
    currency,
    type,
    expenses,
    incomes,
    exchanges,
  });

  const totalPages = Math.ceil(movements.length / PAGE_SIZE);
  const paginated = movements.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const setTypeAndReset = (value: FilterType) => {
    setType(value);
    setPage(0);
  };
  const setCurrencyAndReset = (value: FilterCurrency) => {
    setCurrency(value);
    setPage(0);
  };

  return (
    <div className="flex w-full flex-col gap-6 p-4 md:p-6">
      <h1 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {t('title')}
      </h1>

      <MonthNavigator />

      <div className="flex gap-1.5">
        <div className="flex gap-1">
          <MyToggle
            currentValue={type}
            items={typeFilters}
            onChange={(value) => setTypeAndReset(value as FilterType)}
          />
        </div>
        <div className="flex gap-1">
          <MyToggle
            currentValue={currency}
            items={currencyFilters}
            onChange={(value) => setCurrencyAndReset(value as FilterCurrency)}
          />
        </div>
      </div>

      <Totals type={type} movements={movements} />

      {type === 'expense' && <ExpenseTemplateList />}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <MovementList movements={paginated} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
