import type { Movement } from '@/types/movement'
import { MovementItem } from './movement-item'

export function MovementList({ movements }: { movements: Movement[] }) {
  if (movements.length === 0) {
    return (
      <div className="rounded-xl border bg-background py-12 text-center">
        <p className="text-sm text-muted-foreground">Todavía no hay movimientos.</p>
        <p className="text-xs text-muted-foreground mt-1">Agregá el primero con el botón +</p>
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
