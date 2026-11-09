'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { Movement } from '@/types/movement';
import { Table, TableBody } from '@/components/ui/table';
import { MovementRow } from './movement-row';

type MovementListProps = {
  movements: Movement[];
  /** Rendered inside the card, below the table (e.g. pagination). */
  footer?: ReactNode;
};

export function MovementList({ movements, footer }: MovementListProps) {
  const t = useTranslations('dashboard');

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
