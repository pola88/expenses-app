'use client'

import { useTranslations } from 'next-intl'
import type { Movement } from '@/types/movement'
import { MovementItem } from './movement-item'

export function MovementList({ movements }: { movements: Movement[] }) {
  const t = useTranslations('dashboard')

  if (movements.length === 0) {
    return (
      <div className="rounded-xl border bg-background py-12 text-center">
        <p className="text-sm text-muted-foreground">{t('noMovements')}</p>
        <p className="text-xs text-muted-foreground mt-1">{t('noMovementsCta')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-background divide-y divide-border px-4">
      {movements.map((m) => (
        <MovementItem key={m.id} movement={m} />
      ))}
    </div>
  )
}
