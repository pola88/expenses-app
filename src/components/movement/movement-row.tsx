'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { TableCell, TableRow } from '@/components/ui/table';
import type { Movement } from '@/types/movement';
import { formatMoney, formatRate } from '@/lib/money';
import { cn } from '@/lib/utils';
import { MovementActions } from './movement-actions';
import { CurrencyBadge, Initials, formatDate } from './movement-item';

type RowView = {
  icon: string;
  iconClassName: string;
  title: ReactNode;
  extra?: ReactNode;
  amount?: { value: string; className: string; currency: 'ARS' | 'USD' };
};

const stripCurrency = (value: string) => value.replace(/^(ARS|USD)\$ /, '');

function useRowView(movement: Movement): RowView {
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
}

export function MovementRow({ movement }: { movement: Movement }) {
  const view = useRowView(movement);

  return (
    <TableRow className="group">
      <TableCell className="hidden pl-4 text-xs text-muted-foreground md:table-cell">
        {formatDate(movement.date)}
      </TableCell>

      <TableCell className="py-3 whitespace-normal">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg',
              view.iconClassName
            )}
          >
            {view.icon}
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="line-clamp-2 text-sm font-medium">{view.title}</span>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <Initials name={movement.user.name} />
              {/* Date lives in its own column on desktop */}
              <span className="text-xs text-muted-foreground md:hidden">
                {formatDate(movement.date)}
              </span>
              {view.extra}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-right">
        {view.amount && (
          <div className="flex flex-col items-end gap-1">
            <span className={cn('text-sm font-semibold tabular-nums', view.amount.className)}>
              {view.amount.value}
            </span>
            <CurrencyBadge currency={view.amount.currency} />
          </div>
        )}
      </TableCell>

      <TableCell className="w-10 pr-4">
        <MovementActions movement={movement} />
      </TableCell>
    </TableRow>
  );
}
