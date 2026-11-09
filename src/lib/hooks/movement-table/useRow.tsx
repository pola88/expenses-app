import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { formatMoney, formatRate } from '@/lib/money';
import type { Movement } from '@/types/movement';

type RowView = {
  icon: string;
  iconClassName: string;
  title: ReactNode;
  extra?: ReactNode;
  amount?: { value: string; className: string; currency: 'ARS' | 'USD' };
};

const stripCurrency = (value: string) => value.replace(/^(ARS|USD)\$ /, '');

export const useRowView = (movement: Movement): RowView => {
  const t = useTranslations('dashboard.movement');

  if (movement.type === 'expense') {
    return {
      icon: movement.category.icon,
      iconClassName: 'bg-muted',
      title: movement.description || movement.category.name,
      amount: {
        value: `-${stripCurrency(formatMoney(movement.amount, movement.currency))}`,
        className: 'text-destructive',
        currency: movement.currency,
      },
    };
  }

  if (movement.type === 'income') {
    return {
      icon: '↑',
      iconClassName: 'bg-green-50',
      title: movement.description,
      extra: movement.isRecurring ? (
        <span className="rounded border px-1 py-0.5 text-[10px] text-muted-foreground">
          {t('recurring')}
        </span>
      ) : null,
      amount: {
        value: `+${stripCurrency(formatMoney(movement.amount, movement.currency))}`,
        className: 'text-green-700',
        currency: movement.currency,
      },
    };
  }

  const hasCommission = parseFloat(movement.commissionValue) > 0;
  const commission = hasCommission
    ? movement.commissionType === 'pct'
      ? ` · ${formatRate(movement.commissionValue)}%`
      : ` · ${formatMoney(movement.commissionValue, movement.toCurrency)}`
    : '';

  return {
    icon: '⇄',
    iconClassName: 'bg-muted',
    title: `${formatMoney(movement.fromAmount, movement.fromCurrency)} → ${formatMoney(movement.toAmount, movement.toCurrency)}`,
    extra: (
      <span className="text-xs text-muted-foreground">
        $1 = {formatRate(movement.exchangeRate)}
        {commission}
      </span>
    ),
  };
};
