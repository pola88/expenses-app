import { getTranslations } from 'next-intl/server'
import { requireHousehold } from '@/lib/session'
import { getWalletSummary, getRecentMovements } from '@/services/wallet.service'
import { WalletCard } from '@/components/dashboard/wallet-card'
import { MonthSummary } from '@/components/dashboard/month-summary'
import { MovementList } from '@/components/dashboard/movement-list'
import { ExpensesByCategory } from '@/components/dashboard/expenses-by-category'
import { MonthlyEvolution } from '@/components/dashboard/monthly-evolution'
import { MonthNavigator } from '@/components/ui/month-navigator'
import { parseMonthParam, monthBounds } from '@/lib/month'
import { Suspense } from 'react'

type Props = { searchParams: Promise<{ month?: string }> }

export default async function DashboardPage({ searchParams }: Props) {
  const session = await requireHousehold()
  const householdId = session.user.householdId
  const t = await getTranslations('dashboard')

  const { month: monthParam } = await searchParams
  const selectedMonth = parseMonthParam(monthParam)

  const { from, to } = monthBounds(selectedMonth)

  const [summary, movements] = await Promise.all([
    getWalletSummary(householdId, selectedMonth),
    getRecentMovements(householdId, 10, { from, to }),
  ])

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <section>
        <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          {t('balance')}
        </h1>
        <WalletCard householdId={householdId} initialData={summary} />
      </section>

      <section className="flex flex-col gap-4">
        <Suspense>
          <MonthNavigator />
        </Suspense>
        <MonthSummary householdId={householdId} />
        <Suspense>
          <ExpensesByCategory />
        </Suspense>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          {t('analysis')}
        </h2>
        <MonthlyEvolution />
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          {t('lastMovements')}
        </h2>
        <MovementList movements={movements} />
      </section>
    </div>
  )
}
