'use client'

import Decimal from 'decimal.js'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import type { WalletSummary } from '@/services/wallet.service'
import { apiFetch } from '@/lib/fetch'
import { formatAmount } from '@/lib/money'

type Props = { householdId: string }
type Currency = 'USD' | 'ARS'

function AmountLine({
  label,
  amount,
  strong = false,
}: {
  label: string
  amount: Decimal
  strong?: boolean
}) {
  const positive = amount.gte(0)
  const sign = amount.isZero() ? '' : positive ? '+ ' : '− '

  return (
    <div
      className={`flex items-center justify-between ${strong ? 'mt-1 border-t pt-1.5' : ''}`}
    >
      <span className={strong ? 'text-xs font-semibold' : 'text-xs text-muted-foreground'}>
        {label}
      </span>
      <span
        className={`text-xs tabular-nums ${
          strong
            ? `font-semibold ${positive ? 'text-emerald-600' : 'text-red-600'}`
            : 'text-foreground'
        }`}
      >
        {sign}
        {formatAmount(amount.abs())}
      </span>
    </div>
  )
}

function CurrencyStatement({
  currency,
  incomes,
  expenses,
  exchanges,
  net,
}: {
  currency: Currency
  incomes: string
  expenses: string
  exchanges: string
  net: string
}) {
  const t = useTranslations('dashboard.monthSummary')
  const badgeClass =
    currency === 'USD' ? 'bg-blue-50 text-blue-800' : 'bg-green-50 text-green-800'

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`mb-1 w-fit rounded px-1.5 py-0.5 text-[10px] font-medium ${badgeClass}`}
      >
        {currency}$
      </span>
      <AmountLine label={t('incomeRow')} amount={new Decimal(incomes)} />
      <AmountLine label={t('expenseRow')} amount={new Decimal(expenses).neg()} />
      <AmountLine label={t('exchangeRow')} amount={new Decimal(exchanges)} />
      <AmountLine label={t('result')} amount={new Decimal(net)} strong />
    </div>
  )
}

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
    return <Skeleton className="h-64 rounded-xl" />
  }

  const { incomes, expenses, exchanges, net } = data.month

  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="mb-3 text-xs font-medium text-muted-foreground">{t('net')}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyStatement
          currency="USD"
          incomes={incomes.USD}
          expenses={expenses.USD}
          exchanges={exchanges.USD}
          net={net.USD}
        />
        <CurrencyStatement
          currency="ARS"
          incomes={incomes.ARS}
          expenses={expenses.ARS}
          exchanges={exchanges.ARS}
          net={net.ARS}
        />
      </div>
    </div>
  )
}
