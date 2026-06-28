'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import Decimal from 'decimal.js'
import type { Movement, MovementExpense, MovementIncome, MovementExchange } from '@/types/movement'
import { apiFetch } from '@/lib/fetch'
import { MovementList } from '@/components/dashboard/movement-list'
import { Skeleton } from '@/components/ui/skeleton'
import { MonthNavigator } from '@/components/ui/month-navigator'
import { Pagination } from '@/components/ui/pagination'
import { parseMonthParam, monthBounds } from '@/lib/month'

const fmt = (val: string) =>
  new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    parseFloat(val),
  )

const PAGE_SIZE = 10

type FilterType = 'all' | 'expense' | 'income' | 'exchange'
type FilterCurrency = 'all' | 'ARS' | 'USD'

export default function MovimientosPage() {
  const t = useTranslations('movements')
  const [type, setType] = useState<FilterType>('all')
  const [currency, setCurrency] = useState<FilterCurrency>('all')
  const [page, setPage] = useState(0)

  const searchParams = useSearchParams()
  const selectedMonth = parseMonthParam(searchParams.get('month'))
  const { from: fromDate, to: toDate } = monthBounds(selectedMonth)
  const from = fromDate.toISOString()
  const to = toDate.toISOString()

  const { data: expenses = [], isLoading: loadingE } = useQuery<MovementExpense[]>({
    queryKey: ['expenses', from],
    queryFn: () =>
      apiFetch<MovementExpense[]>(`/api/expenses?from=${from}&to=${to}`).then((items) =>
        items.map((e) => ({ ...e, type: 'expense' as const }))
      ),
  })

  const { data: incomes = [], isLoading: loadingI } = useQuery<MovementIncome[]>({
    queryKey: ['incomes', from],
    queryFn: () =>
      apiFetch<MovementIncome[]>(`/api/incomes?from=${from}&to=${to}`).then((items) =>
        items.map((i) => ({ ...i, type: 'income' as const }))
      ),
  })

  const { data: exchanges = [], isLoading: loadingX } = useQuery<MovementExchange[]>({
    queryKey: ['exchanges', from],
    queryFn: () =>
      apiFetch<MovementExchange[]>(`/api/exchanges?from=${from}&to=${to}`).then((items) =>
        items.map((x) => ({ ...x, type: 'exchange' as const }))
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

  const totals = useMemo(() => {
    if (type === 'all') return null
    if (type === 'expense' || type === 'income') {
      const items = movements.filter((m): m is MovementExpense | MovementIncome => m.type !== 'exchange')
      const sum = (cur: 'ARS' | 'USD') =>
        items.filter((m) => m.currency === cur).reduce((acc, m) => acc.plus(m.amount), new Decimal(0)).toFixed(2)
      return { ARS: sum('ARS'), USD: sum('USD') }
    }
    // type === 'exchange'
    const items = movements.filter((m): m is MovementExchange => m.type === 'exchange')
    const sum = (cur: 'ARS' | 'USD') =>
      items.reduce((acc, x) => {
        if (x.fromCurrency === cur) acc = acc.plus(x.fromAmount)
        if (x.toCurrency === cur) acc = acc.plus(x.toAmount)
        return acc
      }, new Decimal(0)).toFixed(2)
    return { ARS: sum('ARS'), USD: sum('USD') }
  }, [movements, type])

  const totalPages = Math.ceil(movements.length / PAGE_SIZE)
  const paginated = movements.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const setTypeAndReset = (value: FilterType) => { setType(value); setPage(0) }
  const setCurrencyAndReset = (value: FilterCurrency) => { setCurrency(value); setPage(0) }

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

      <MonthNavigator />

      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1">
          {typeFilters.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => setTypeAndReset(value)} className={chip(type === value)}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {currencyFilters.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => setCurrencyAndReset(value)} className={chip(currency === value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {totals && (
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
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <MovementList movements={paginated} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
