import { requireHousehold } from '@/lib/session'
import { getWalletSummary, getRecentMovements } from '@/services/wallet.service'
import { WalletCard } from '@/components/dashboard/wallet-card'
import { MonthSummary } from '@/components/dashboard/month-summary'
import { MovementList } from '@/components/dashboard/movement-list'
import { PendingRecurring } from '@/components/dashboard/pending-recurring'
import { ExpensesByCategory } from '@/components/dashboard/expenses-by-category'
import { MonthlyEvolution } from '@/components/dashboard/monthly-evolution'

export default async function DashboardPage() {
  const session = await requireHousehold()
  const householdId = session.user.householdId

  const [summary, movements] = await Promise.all([
    getWalletSummary(householdId, new Date()),
    getRecentMovements(householdId, 10),
  ])

  const now = new Date()
  const monthLabel = now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <section>
        <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Balance
        </h1>
        <WalletCard householdId={householdId} initialData={summary} />
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 capitalize">
          {monthLabel}
        </h2>
        <MonthSummary householdId={householdId} initialData={summary} />
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Análisis
        </h2>
        <div className="flex flex-col gap-4">
          <ExpensesByCategory />
          <MonthlyEvolution />
        </div>
      </section>

      <PendingRecurring />

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Últimos movimientos
        </h2>
        <MovementList movements={movements} />
      </section>
    </div>
  )
}
