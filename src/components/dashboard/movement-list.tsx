'use client';

import { useTranslations } from 'next-intl';
import type { Movement } from '@/types/movement';
import { MovementItem } from './movement-item';

export function MovementList({ movements }: { movements: Movement[] }) {
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
    <div className="divide-y divide-border rounded-xl border bg-card px-4">
      <h2 className="py-4 text-sm font-semibold tracking-widest">{t('lastMovements')}</h2>

      {movements.map((m) => (
        <MovementItem key={m.id} movement={m} />
      ))}
    </div>
  );
}
