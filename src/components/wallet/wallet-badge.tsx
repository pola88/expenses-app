'use client'

import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'

type WalletBalance = { ARS: string; USD: string }
type WalletSummary = { balance: WalletBalance; month: { incomes: WalletBalance; expenses: WalletBalance } }

export function WalletBadge({ householdId }: { householdId: string }) {
  const { data, isLoading } = useQuery<WalletSummary>({
    queryKey: ['wallet', householdId],
    queryFn: () => fetch('/api/wallet').then((r) => r.json()),
    staleTime: 30_000,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 px-1">
        <Skeleton className="h-7 w-full rounded-md" />
        <Skeleton className="h-7 w-full rounded-md" />
      </div>
    )
  }

  const fmt = (val: string) =>
    new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(val))

  return (
    <div className="flex flex-col gap-1.5 px-1">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Wallet</p>
      <div className="flex items-center justify-between rounded-md border border-border bg-background px-2 py-1.5">
        <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-800">USD$</span>
        <span className="text-sm font-medium">{data ? fmt(data.balance.USD) : '—'}</span>
      </div>
      <div className="flex items-center justify-between rounded-md border border-border bg-background px-2 py-1.5">
        <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-green-50 text-green-800">ARS$</span>
        <span className="text-sm font-medium">{data ? fmt(data.balance.ARS) : '—'}</span>
      </div>
    </div>
  )
}
