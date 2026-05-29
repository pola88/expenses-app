'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import type { Movement, MovementExpense, MovementIncome, MovementExchange } from '@/types/movement'
import { MovementList } from '@/components/dashboard/movement-list'
import { Skeleton } from '@/components/ui/skeleton'

type FilterType = 'todos' | 'gasto' | 'ingreso' | 'cambio'
type FilterCurrency = 'todas' | 'ARS' | 'USD'

function toMovementExpense(e: MovementExpense & { user: { id: string; name: string | null } }): MovementExpense {
  return { ...e, type: 'expense' }
}

export default function MovimientosPage() {
  const [type, setType] = useState<FilterType>('todos')
  const [currency, setCurrency] = useState<FilterCurrency>('todas')

  const { data: expenses = [], isLoading: loadingE } = useQuery<MovementExpense[]>({
    queryKey: ['expenses'],
    queryFn: () =>
      fetch('/api/expenses').then((r) => r.json()).then((items) =>
        items.map((e: MovementExpense) => ({ ...e, type: 'expense' as const }))
      ),
  })

  const { data: incomes = [], isLoading: loadingI } = useQuery<MovementIncome[]>({
    queryKey: ['incomes'],
    queryFn: () =>
      fetch('/api/incomes').then((r) => r.json()).then((items) =>
        items.map((i: MovementIncome) => ({ ...i, type: 'income' as const }))
      ),
  })

  const { data: exchanges = [], isLoading: loadingX } = useQuery<MovementExchange[]>({
    queryKey: ['exchanges'],
    queryFn: () =>
      fetch('/api/exchanges').then((r) => r.json()).then((items) =>
        items.map((x: MovementExchange) => ({ ...x, type: 'exchange' as const }))
      ),
  })

  const isLoading = loadingE || loadingI || loadingX

  const movements = useMemo<Movement[]>(() => {
    let all: Movement[] = [...expenses, ...incomes, ...exchanges]

    if (type !== 'todos') {
      const typeMap = { gasto: 'expense', ingreso: 'income', cambio: 'exchange' } as const
      all = all.filter((m) => m.type === typeMap[type])
    }

    if (currency !== 'todas') {
      all = all.filter((m) => {
        if (m.type === 'exchange') return m.fromCurrency === currency || m.toCurrency === currency
        return m.currency === currency
      })
    }

    return all.sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, incomes, exchanges, type, currency])

  const btnClass = (active: boolean) =>
    `rounded-lg border px-3 py-1.5 text-sm transition-colors ${
      active ? 'border-foreground bg-muted font-medium' : 'border-border text-muted-foreground'
    }`

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-2xl mx-auto w-full">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Movimientos
      </h1>

      <div className="flex flex-wrap gap-2">
        {(['todos', 'gasto', 'ingreso', 'cambio'] as FilterType[]).map((t) => (
          <button key={t} type="button" onClick={() => setType(t)} className={btnClass(type === t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {(['todas', 'ARS', 'USD'] as FilterCurrency[]).map((c) => (
            <button key={c} type="button" onClick={() => setCurrency(c)} className={btnClass(currency === c)}>
              {c === 'todas' ? 'Todas' : `${c}$`}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <MovementList movements={movements} />
      )}
    </div>
  )
}
