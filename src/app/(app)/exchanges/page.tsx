'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import Decimal from 'decimal.js'
import type { MovementExchange } from '@/types/movement'
import { apiFetch } from '@/lib/fetch'
import { MovementItem } from '@/components/dashboard/movement-item'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/ui/pagination'

const PAGE_SIZE = 10

const fmt = (val: string) =>
  new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    parseFloat(val),
  )

export default function CambiosPage() {
  const t = useTranslations('exchanges')
  const [page, setPage] = useState(0)

  const { data: exchanges = [], isLoading } = useQuery<MovementExchange[]>({
    queryKey: ['exchanges'],
    queryFn: () =>
      apiFetch<MovementExchange[]>('/api/exchanges').then((items) =>
        items.map((x) => ({ ...x, type: 'exchange' as const }))
      ),
  })

  const sorted = useMemo(
    () => [...exchanges].sort((a, b) => b.date.localeCompare(a.date)),
    [exchanges],
  )

  const totals = useMemo(() => {
    const sum = (currency: 'ARS' | 'USD') =>
      exchanges
        .reduce((acc, x) => {
          if (x.fromCurrency === currency) acc = acc.plus(x.fromAmount)
          if (x.toCurrency === currency) acc = acc.plus(x.toAmount)
          return acc
        }, new Decimal(0))
        .toFixed(2)
    return { ARS: sum('ARS'), USD: sum('USD') }
  }, [exchanges])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-2xl mx-auto w-full">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t('title')}
      </h1>

      {!isLoading && exchanges.length > 0 && (
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
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border bg-background py-12 text-center">
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('emptyCta')}</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border bg-background divide-y divide-border px-4">
            {paginated.map((exchange) => (
              <MovementItem key={exchange.id} movement={exchange} />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
