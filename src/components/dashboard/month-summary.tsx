'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import type { WalletSummary } from '@/services/wallet.service'
import { apiFetch } from '@/lib/fetch'

const fmt = (val: string) =>
  new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    parseFloat(val),
  )

type Props = { householdId: string }

export function MonthSummary({ householdId }: Props) {
  const t = useTranslations('dashboard.monthSummary')
  const searchParams = useSearchParams()
  const month = searchParams.get('month') ?? undefined

  const { data, isLoading } = useQuery<WalletSummary>({
    queryKey: ['wallet-month', householdId, month],
    queryFn: () => {
      const url = month ? `/api/wallet?month=${month}` : '/api/wallet'
      return apiFetch<WalletSummary>(url)
    },
  })

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    )
  }

  const { incomes, expenses } = data.month

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border bg-background p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">{t('incomes')}</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-800">USD$</span>
            <span className="text-sm font-semibold tabular-nums">{fmt(incomes.USD)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-green-50 text-green-800">ARS$</span>
            <span className="text-sm font-semibold tabular-nums">{fmt(incomes.ARS)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-background p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">{t('expenses')}</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-800">USD$</span>
            <span className="text-sm font-semibold tabular-nums">{fmt(expenses.USD)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-green-50 text-green-800">ARS$</span>
            <span className="text-sm font-semibold tabular-nums">{fmt(expenses.ARS)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
