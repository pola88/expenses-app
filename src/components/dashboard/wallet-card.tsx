'use client'

import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import type { WalletSummary } from '@/services/wallet.service'

const fmt = (val: string) =>
  new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    parseFloat(val),
  )

type Props = { householdId: string; initialData: WalletSummary }

export function WalletCard({ householdId, initialData }: Props) {
  const { data, isLoading } = useQuery<WalletSummary>({
    queryKey: ['wallet', householdId],
    queryFn: () => fetch('/api/wallet').then((r) => r.json()),
    initialData,
    staleTime: 30_000,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <span className="text-xs font-semibold tracking-wide text-blue-600">USD$</span>
        <p className="mt-1.5 text-2xl font-bold tabular-nums text-blue-900">
          {fmt(data.balance.USD)}
        </p>
      </div>
      <div className="rounded-xl border border-green-100 bg-green-50 p-4">
        <span className="text-xs font-semibold tracking-wide text-green-600">ARS$</span>
        <p className="mt-1.5 text-2xl font-bold tabular-nums text-green-900">
          {fmt(data.balance.ARS)}
        </p>
      </div>
    </div>
  )
}
