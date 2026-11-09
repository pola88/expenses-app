import { useMemo } from 'react';
import type { Movement, MovementExpense, MovementIncome, MovementExchange } from '@/types/movement';
import { useTranslations } from 'next-intl';
import type { FilterType, FilterCurrency } from '@/types/transaction-page';

type UseTransactionsAttrs = {
  expenses: MovementExpense[];
  incomes: MovementIncome[];
  exchanges: MovementExchange[];
  type: FilterType;
  currency: FilterCurrency;
};

export const useTransactions = ({
  currency,
  type,
  exchanges,
  expenses,
  incomes,
}: UseTransactionsAttrs) => {
  const t = useTranslations('movements');

  const movements = useMemo<Movement[]>(() => {
    let all: Movement[] = [...expenses, ...incomes, ...exchanges];

    if (type !== 'all') {
      all = all.filter((m) => m.type === type);
    }

    if (currency !== 'all') {
      all = all.filter((m) => {
        if (m.type === 'exchange') return m.fromCurrency === currency || m.toCurrency === currency;
        return m.currency === currency;
      });
    }

    return all.sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, incomes, exchanges, type, currency]);

  const typeFilters: { value: FilterType; label: string }[] = [
    { value: 'all', label: t('all') },
    { value: 'expense', label: t('expense') },
    { value: 'income', label: t('income') },
    { value: 'exchange', label: t('exchange') },
  ];

  const currencyFilters: { value: FilterCurrency; label: string }[] = [
    { value: 'all', label: t('allCurrencies') },
    { value: 'ARS', label: 'ARS' },
    { value: 'USD', label: 'USD' },
  ];

  return { movements, typeFilters, currencyFilters };
};
