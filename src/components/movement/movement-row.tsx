'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import type { Movement } from '@/types/movement';
import { cn } from '@/lib/utils';
import { MovementActions } from './movement-actions';
import { CurrencyBadge } from '@/components/currency-badge';
import { Initials } from '@/components/initials';
import { formatDate } from '@/lib/date';
import { useRowView } from '@/lib/hooks/movement-table/useRow';

export function MovementRow({ movement }: { movement: Movement }) {
  const view = useRowView(movement);

  return (
    <TableRow className="group">
      <TableCell className="hidden w-20 pl-4 text-xs text-muted-foreground md:table-cell">
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
