'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { Movement, MovementExpense, MovementIncome, MovementExchange } from '@/types/movement'
import { MovementList } from '@/components/dashboard/movement-list'
import { Skeleton } from '@/components/ui/skeleton'

type FilterType = 'all' | 'expense' | 'income' | 'exchange'
type FilterCurrency = 'all' | 'ARS' | 'USD'

export default function MovimientosPage() {
  const t = useTranslations('movements')
  const [type, setType] = useState<FilterType>('all')
  const [currency, setCurrency] = useState<FilterCurrency>('all')

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

    if (type !== 'all') {
      all = all.filter((m) => m.type === type)
    }

    if (currency !== 'all') {
      all = all.filter((m) => {
        if (m.type === 'exchange') return m.fromCurrency === currency || m.toCurrency === currency
        return m.currency === currency
      })
    }

    return all.sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, incomes, exchanges, type, currency])

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-sm font-medium transition-colors ${
      active ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
    }`

  const typeFilters: { value: FilterType; label: string }[] = [
    { value: 'all', label: t('all') },
    { value: 'expense', label: t('expense') },
    { value: 'income', label: t('income') },
    { value: 'exchange', label: t('exchange') },
  ]

  const currencyFilters: { value: FilterCurrency; label: string }[] = [
    { value: 'all', label: t('allCurrencies') },
    { value: 'ARS', label: 'ARS$' },
    { value: 'USD', label: 'USD$' },
  ]

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-2xl mx-auto w-full">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t('title')}
      </h1>

      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1">
          {typeFilters.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => setType(value)} className={chip(type === value)}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {currencyFilters.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => setCurrency(value)} className={chip(currency === value)}>
              {label}
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
