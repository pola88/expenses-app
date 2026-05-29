'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import Decimal from 'decimal.js'
import type { MovementIncome } from '@/types/movement'
import { MovementItem } from '@/components/dashboard/movement-item'
import { Skeleton } from '@/components/ui/skeleton'

type Filter = 'todos' | 'variable' | 'recurrente'

const fmt = (val: string) =>
  new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    parseFloat(val),
  )

export default function IngresosPage() {
  const [filter, setFilter] = useState<Filter>('todos')

  const { data: incomes = [], isLoading } = useQuery<MovementIncome[]>({
    queryKey: ['incomes'],
    queryFn: () =>
      fetch('/api/incomes').then((r) => r.json()).then((items) =>
        items.map((i: MovementIncome) => ({ ...i, type: 'income' as const }))
      ),
  })

  const filtered = useMemo(() => {
    if (filter === 'variable') return incomes.filter((i) => !i.isRecurring)
    if (filter === 'recurrente') return incomes.filter((i) => i.isRecurring)
    return incomes
  }, [incomes, filter])

  const totals = useMemo(() => {
    const sum = (currency: 'ARS' | 'USD') =>
      filtered
        .filter((i) => i.currency === currency)
        .reduce((acc, i) => acc.plus(i.amount), new Decimal(0))
        .toFixed(2)
    return { ARS: sum('ARS'), USD: sum('USD') }
  }, [filtered])

  const btnClass = (active: boolean) =>
    `rounded-lg border px-3 py-1.5 text-sm transition-colors ${
      active ? 'border-foreground bg-muted font-medium' : 'border-border text-muted-foreground'
    }`

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-2xl">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Ingresos
      </h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <span className="text-xs font-semibold tracking-wide text-blue-600">USD$</span>
          <p className="mt-1 text-xl font-bold tabular-nums text-blue-900">{fmt(totals.USD)}</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <span className="text-xs font-semibold tracking-wide text-green-600">ARS$</span>
          <p className="mt-1 text-xl font-bold tabular-nums text-green-900">{fmt(totals.ARS)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['todos', 'variable', 'recurrente'] as Filter[]).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={btnClass(filter === f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border bg-background py-12 text-center">
          <p className="text-sm text-muted-foreground">No hay ingresos registrados.</p>
          <p className="text-xs text-muted-foreground mt-1">Agregá el primero con el botón +</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-background divide-y divide-border px-4">
          {sorted.map((income) => (
            <MovementItem key={income.id} movement={income} />
          ))}
        </div>
      )}
    </div>
  )
}
