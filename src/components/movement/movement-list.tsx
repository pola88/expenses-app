'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { Movement } from '@/types/movement';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MovementRow } from './movement-row';

type MovementListProps = {
  movements: Movement[];
  /** Rendered inside the card, below the table (e.g. pagination). */
  footer?: ReactNode;
};

export function MovementList({ movements, footer }: MovementListProps) {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  if (movements.length === 0) {
    return (
      <div className="rounded-xl border bg-card py-12 text-center">
        <p className="text-sm text-muted-foreground">{t('noMovements')}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t('noMovementsCta')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <h2 className="px-4 py-4 text-sm font-semibold tracking-widest">{t('lastMovements')}</h2>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="hidden w-20 pl-4 text-xs text-muted-foreground md:table-cell">
              {t('table.date')}
            </TableHead>
            <TableHead className="pl-4 text-xs text-muted-foreground">
              {t('table.movement')}
            </TableHead>
            <TableHead className="text-right text-xs text-muted-foreground">
              {t('table.amount')}
            </TableHead>
            <TableHead className="w-10 pr-4">
              <span className="sr-only">{tCommon('actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m) => (
            <MovementRow key={m.id} movement={m} />
          ))}
        </TableBody>
      </Table>

      {footer && <div className="border-t px-4 py-3">{footer}</div>}
    </div>
  );
}
