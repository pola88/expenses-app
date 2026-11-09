import { useMemo } from 'react';
import Decimal from 'decimal.js';
import type { Movement, MovementExpense, MovementIncome, MovementExchange } from '@/types/movement';
import type { FilterType } from '@/types/transaction-page';

type UseTotalsAttrs = {
  movements: Movement[];
  type: FilterType;
};

export const useTotals = ({ type, movements }: UseTotalsAttrs) => {
  const totals = useMemo(() => {
    if (type === 'all') return null;
    if (type === 'expense' || type === 'income') {
      const items = movements.filter(
        (m): m is MovementExpense | MovementIncome => m.type !== 'exchange'
      );
      const sum = (cur: 'ARS' | 'USD') =>
        items
          .filter((m) => m.currency === cur)
          .reduce((acc, m) => acc.plus(m.amount), new Decimal(0))
          .toFixed(2);
      return { ARS: sum('ARS'), USD: sum('USD') };
    }
    const items = movements.filter((m): m is MovementExchange => m.type === 'exchange');
    const sum = (cur: 'ARS' | 'USD') =>
      items
        .reduce((acc, x) => {
          if (x.fromCurrency === cur) acc = acc.plus(x.fromAmount);
          if (x.toCurrency === cur) acc = acc.plus(x.toAmount);
          return acc;
        }, new Decimal(0))
        .toFixed(2);
    return { ARS: sum('ARS'), USD: sum('USD') };
  }, [movements, type]);

  return totals;
};
