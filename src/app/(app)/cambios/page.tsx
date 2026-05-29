'use client'

import { useQuery } from '@tanstack/react-query'
import type { MovementExchange } from '@/types/movement'
import { MovementItem } from '@/components/dashboard/movement-item'
import { Skeleton } from '@/components/ui/skeleton'

export default function CambiosPage() {
  const { data: exchanges = [], isLoading } = useQuery<MovementExchange[]>({
    queryKey: ['exchanges'],
    queryFn: () =>
      fetch('/api/exchanges').then((r) => r.json()).then((items) =>
        items.map((x: MovementExchange) => ({ ...x, type: 'exchange' as const }))
      ),
  })

  const sorted = [...exchanges].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-2xl">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Cambios de moneda
      </h1>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border bg-background py-12 text-center">
          <p className="text-sm text-muted-foreground">No hay cambios registrados.</p>
          <p className="text-xs text-muted-foreground mt-1">Agregá el primero con el botón +</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-background divide-y divide-border px-4">
          {sorted.map((exchange) => (
            <MovementItem key={exchange.id} movement={exchange} />
          ))}
        </div>
      )}
    </div>
  )
}
